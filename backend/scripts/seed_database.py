"""
Database Seeder Script

This script populates the SmartMart database with sample data for development and testing.
It creates categories, products, and generates sales data to make the dashboard functional.

Usage:
    python seed_database.py
"""
import sys
import os
import random
from datetime import datetime, timedelta
import decimal

# Add parent directory to path so we can import our database modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal, engine
from app.models.models import Base, Category, Product, Sale

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def seed_categories():
    """Seed the categories table with sample data"""
    db = SessionLocal()
    
    # Check if categories already exist
    existing_count = db.query(Category).count()
    if existing_count > 0:
        print(f"Found {existing_count} existing categories. Skipping category seeding.")
        db.close()
        return
    
    categories = [
        {"name": "TVs"},
        {"name": "Refrigerators"},
        {"name": "Laptops"},
        {"name": "Microwaves"},
        {"name": "Smartphones"}
    ]
    
    for category_data in categories:
        category = Category(**category_data)
        db.add(category)
    
    db.commit()
    print(f"Added {len(categories)} categories")
    db.close()

def seed_products():
    """Seed the products table with sample data"""
    db = SessionLocal()
    
    # Check if products already exist
    existing_count = db.query(Product).count()
    if existing_count > 0:
        print(f"Found {existing_count} existing products. Skipping product seeding.")
        db.close()
        return
    
    # Get the category IDs
    categories = db.query(Category).all()
    category_ids = [c.id for c in categories]
    
    # Sample product data
    products = [
        {
            "name": "Samsung 55\" 4K Smart TV",
            "description": "Ultra HD Smart TV with HDR",
            "price": 699.99,
            "category_id": 1,  # TVs
            "stock": 15,
            "brand": "Samsung"
        },
        {
            "name": "LG 65\" OLED TV",
            "description": "OLED TV with perfect blacks",
            "price": 1299.99,
            "category_id": 1,  # TVs
            "stock": 8,
            "brand": "LG"
        },
        {
            "name": "Sony 50\" LED TV",
            "description": "LED TV with excellent picture quality",
            "price": 549.99,
            "category_id": 1,  # TVs
            "stock": 12,
            "brand": "Sony"
        },
        {
            "name": "Samsung French Door Refrigerator",
            "description": "Large capacity refrigerator with ice maker",
            "price": 1499.99,
            "category_id": 2,  # Refrigerators
            "stock": 5,
            "brand": "Samsung"
        },
        {
            "name": "LG Side-by-Side Refrigerator",
            "description": "Energy efficient side-by-side model",
            "price": 1199.99,
            "category_id": 2,  # Refrigerators
            "stock": 7,
            "brand": "LG"
        },
        {
            "name": "Dell XPS 13 Laptop",
            "description": "Ultralight laptop with 11th Gen Intel processor",
            "price": 999.99,
            "category_id": 3,  # Laptops
            "stock": 20,
            "brand": "Dell"
        },
        {
            "name": "MacBook Pro 14\"",
            "description": "Professional laptop with M1 Pro chip",
            "price": 1999.99,
            "category_id": 3,  # Laptops
            "stock": 10,
            "brand": "Apple"
        },
        {
            "name": "HP Pavilion Laptop",
            "description": "Budget-friendly laptop for everyday use",
            "price": 599.99,
            "category_id": 3,  # Laptops
            "stock": 25,
            "brand": "HP"
        },
        {
            "name": "Panasonic Countertop Microwave",
            "description": "1.2 cubic foot microwave with inverter technology",
            "price": 149.99,
            "category_id": 4,  # Microwaves
            "stock": 30,
            "brand": "Panasonic"
        },
        {
            "name": "Samsung Microwave Oven",
            "description": "Smart microwave with sensor cooking",
            "price": 189.99,
            "category_id": 4,  # Microwaves
            "stock": 18,
            "brand": "Samsung"
        },
        {
            "name": "iPhone 14 Pro",
            "description": "Apple's latest flagship smartphone",
            "price": 999.99,
            "category_id": 5,  # Smartphones
            "stock": 50,
            "brand": "Apple"
        },
        {
            "name": "Samsung Galaxy S23",
            "description": "Top-tier Android smartphone with excellent camera",
            "price": 899.99,
            "category_id": 5,  # Smartphones
            "stock": 45,
            "brand": "Samsung"
        },
        {
            "name": "Google Pixel 7",
            "description": "Google's smartphone with best-in-class camera",
            "price": 699.99,
            "category_id": 5,  # Smartphones
            "stock": 30,
            "brand": "Google"
        },
    ]
    
    for product_data in products:
        product = Product(**product_data)
        db.add(product)
    
    db.commit()
    print(f"Added {len(products)} products")
    db.close()

def seed_sales():
    """Generate sales data for the past two years"""
    db = SessionLocal()
    
    # Check if sales already exist
    existing_count = db.query(Sale).count()
    if existing_count > 0:
        print(f"Found {existing_count} existing sales. Skipping sales seeding.")
        db.close()
        return
    
    # Get all products
    products = db.query(Product).all()
    if not products:
        print("No products found. Please seed products first.")
        db.close()
        return
    
    # Generate sales for the current and previous year
    current_year = datetime.now().year
    years = [current_year, current_year - 1]
    
    sales_data = []
    
    # For each year and month, generate random sales
    for year in years:
        for month in range(1, 13):
            # Skip future months in current year
            if year == current_year and month > datetime.now().month:
                continue
            
            # Generate between 20-50 sales for each month
            num_sales = random.randint(20, 50)
            
            for _ in range(num_sales):
                # Select a random product
                product = random.choice(products)
                
                # Random quantity between 1 and 3
                quantity = random.randint(1, 3)
                
                # Calculate total price (with a small random discount/premium)
                price_factor = random.uniform(0.95, 1.05)
                total_price = decimal.Decimal(product.price * quantity * price_factor).quantize(
                    decimal.Decimal('0.01'), rounding=decimal.ROUND_HALF_UP
                )
                
                # Random day in the month
                max_day = 28 if month == 2 else 30 if month in [4, 6, 9, 11] else 31
                day = random.randint(1, max_day)
                
                # Create the sale date
                sale_date = datetime(year, month, day)
                
                # Create and add the sale
                sale = Sale(
                    product_id=product.id,
                    quantity=quantity,
                    total_price=total_price,
                    date=sale_date
                )
                sales_data.append(sale)
    
    # Batch add sales for better performance
    db.bulk_save_objects(sales_data)
    db.commit()
    
    print(f"Added {len(sales_data)} sales records")
    db.close()

if __name__ == "__main__":
    print("Starting database seeding...")
    seed_categories()
    seed_products()
    seed_sales()
    print("Database seeding completed successfully!")
