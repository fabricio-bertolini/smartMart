from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, Boolean, Enum, JSON, Numeric
from sqlalchemy.orm import relationship, validates
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class BaseModel(Base):
    __abstract__ = True
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

class ProductStatus(enum.Enum):
    ACTIVE = "active"
    OUT_OF_STOCK = "out_of_stock"
    DISCONTINUED = "discontinued"

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    products = relationship("Product", back_populates="category")

    @validates('name')
    def validate_name(self, key, name):
        if not name or len(name) < 2:
            raise ValueError('Category name must be at least 2 characters')
        return name

    @property
    def total_products_value(self):
        return sum(product.price * product.stock for product in self.products)

    @property
    def low_stock_products(self):
        return [p for p in self.products if p.needs_restock]

class BatchOperation(BaseModel):
    __tablename__ = "batch_operations"
    id = Column(Integer, primary_key=True, index=True)
    operation_type = Column(String)
    changes = Column(JSON)
    status = Column(String, default="pending")

class ProductVariant(BaseModel):
    __tablename__ = "product_variants"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    sku = Column(String, unique=True)
    attributes = Column(JSON)
    stock = Column(Integer, default=0)
    price_adjustment = Column(Float, default=0.0)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    category_id = Column(Integer, ForeignKey("categories.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    category = relationship("Category", back_populates="products")
    sales = relationship("Sale", back_populates="product")
    status = Column(Enum(ProductStatus), default=ProductStatus.ACTIVE)
    min_stock_level = Column(Integer, default=10)
    variants = relationship("ProductVariant", backref="product")
    discount_percentage = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)
    
    @property
    def profit_margin(self):
        return (self.price - self.cost) / self.cost * 100 if self.cost else 0

    @validates('price', 'cost')
    def validate_amounts(self, key, value):
        if value < 0:
            raise ValueError(f'{key} cannot be negative')
        return value

    @property
    def needs_restock(self):
        return self.stock <= self.min_stock_level

    def update_stock(self, quantity: int):
        if self.stock + quantity < 0:
            raise ValueError("Insufficient stock")
        self.stock += quantity
        if self.stock == 0:
            self.status = ProductStatus.OUT_OF_STOCK
        elif self.stock > 0:
            self.status = ProductStatus.ACTIVE

    @classmethod
    def search(cls, session, query: str):
        return session.query(cls).filter(
            cls.name.ilike(f"%{query}%") |
            cls.description.ilike(f"%{query}%")
        ).all()

    @validates('stock')
    def validate_stock(self, key, value):
        if value < 0:
            raise ValueError("Stock cannot be negative")
        return value

    @property
    def final_price(self):
        if self.discount_percentage > 0:
            discount = self.price * (self.discount_percentage / 100)
            base_price = self.price - discount
        else:
            base_price = self.price
        return base_price * (1 + self.tax_rate)

    @classmethod
    def batch_update_stock(cls, session, updates):
        batch_op = BatchOperation(
            operation_type="stock_update",
            changes=updates
        )
        session.add(batch_op)
        
        for product_id, quantity in updates.items():
            product = session.query(cls).get(product_id)
            if product:
                product.update_stock(quantity)
        
        batch_op.status = "completed"
        session.commit()
        return batch_op

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "final_price": self.final_price,
            "stock": self.stock,
            "status": self.status.value,
            "variants": [v.attributes for v in self.variants]
        }

class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    profit = Column(Float, nullable=False)
    transaction_date = Column(Date, nullable=False)

    # Relationship
    product = relationship("Product", back_populates="sales")

    @property
    def profit(self):
        return self.total_price - (self.cost_at_sale * self.quantity)

    @property
    def net_profit(self):
        return self.profit - (self.total_price * self.tax_rate)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.product:
            self.cost_at_sale = self.product.cost
