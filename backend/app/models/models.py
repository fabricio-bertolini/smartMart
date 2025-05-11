"""
Database Models Module

This module defines the SQLAlchemy ORM models for the SmartMart application.
These models represent the database schema and provide object-oriented
access to the underlying tables.

Models:
- Product: Represents retail products with their details and inventory information
- Category: Represents product categories for organization and filtering
- Sale: Represents individual sales transactions with product references
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, Boolean, Enum, JSON
from sqlalchemy.orm import relationship, validates
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class Category(Base):
    """
    Category Model
    
    Represents product categories for organization and filtering.
    
    Attributes:
        id (int): Primary key and unique identifier
        name (str): Category name
        products (list): Relationship to associated Product records
    """
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
    
    def __repr__(self):
        """String representation of the Category model."""
        return f"<Category(id={self.id}, name='{self.name}')>"

class Product(Base):
    """
    Product Model
    
    Represents retail products in the inventory system with their
    details, pricing information, category association, and status.
    
    Attributes:
        id (int): Primary key and unique identifier
        name (str): Product name
        description (str): Detailed product description
        price (float): Current selling price
        category_id (int): Foreign key to associated category
        category (Category): Relationship to Category model
        brand (str): Manufacturer or brand name
        status (ProductStatus): Current inventory status
        sales (list): Relationship to associated sales records
    """
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
    
    def __repr__(self):
        """String representation of the Product model."""
        return f"<Product(id={self.id}, name='{self.name}', price={self.price})>"

class Sale(Base):
    """
    Sale Model
    
    Represents individual sales transactions with product references,
    quantities, pricing information, and timestamps.
    
    Attributes:
        id (int): Primary key and unique identifier
        product_id (int): Foreign key to associated product
        product (Product): Relationship to Product model
        quantity (int): Number of products sold
        total_price (float): Total sale price (price * quantity)
        date (datetime): Timestamp when the sale occurred
    """
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    date = Column(Date, nullable=False)

    product = relationship("Product", back_populates="sales")
    
    def __repr__(self):
        """String representation of the Sale model."""
        return f"<Sale(id={self.id}, product_id={self.product_id}, quantity={self.quantity}, total=${self.total_price})>"
