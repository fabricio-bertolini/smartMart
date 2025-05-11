from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, Boolean, Enum, JSON
from sqlalchemy.orm import relationship, validates
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    products = relationship("Product", back_populates="category")

    @validates('name')
    def validate_name(self, key, name):
        if not name or len(name) < 2:
            raise ValueError('Category name must be at least 2 characters')
        return name

    @property
    def total_products_value(self):
        return sum(product.price for product in self.products)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    brand = Column(String(100), nullable=False)

    category = relationship("Category", back_populates="products")
    sales = relationship("Sale", back_populates="product")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "category_id": self.category_id,
            "brand": self.brand
        }

class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    date = Column(Date, nullable=False)

    product = relationship("Product", back_populates="sales")
