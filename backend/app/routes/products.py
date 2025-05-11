"""
Products API Routes Module

This module defines the FastAPI routes for product management operations.
It handles CRUD operations for products including listing, retrieval,
creation, updating, and deletion.

Routes:
- GET /products: List all products with optional filtering
- GET /products/{product_id}: Get a specific product by ID
- POST /products: Create a new product
- PUT /products/{product_id}: Update an existing product
- DELETE /products/{product_id}: Delete a product
"""

from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Product, Category
import pandas as pd
from io import StringIO
import csv
from typing import Optional

router = APIRouter()

@router.post("/products/")
async def create_product(product: dict, db: Session = Depends(get_db)):
    required_fields = {"name", "description", "price", "category_id", "brand"}
    if not all(field in product for field in required_fields):
        raise HTTPException(status_code=400, detail="Missing required fields")
    db_product = Product(
        name=product["name"],
        description=product["description"],
        price=product["price"],
        category_id=product["category_id"],
        brand=product["brand"]
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product.to_dict()

@router.get("/products/")
async def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return [p.to_dict() for p in products]

@router.put("/products/{product_id}")
async def update_product(product_id: int, updates: dict, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key in ["name", "description", "price", "category_id", "brand"]:
        if key in updates:
            setattr(product, key, updates[key])
    db.commit()
    db.refresh(product)
    return product.to_dict()

@router.post("/products/upload-csv")
async def upload_products_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    df = pd.read_csv(StringIO(content.decode()))
    required_columns = {"name", "description", "price", "category_id", "brand"}
    if not required_columns.issubset(df.columns):
        raise HTTPException(status_code=400, detail="CSV missing required columns")
    for _, row in df.iterrows():
        db_product = Product(
            name=row["name"],
            description=row["description"],
            price=row["price"],
            category_id=row["category_id"],
            brand=row["brand"]
        )
        db.add(db_product)
    db.commit()
    return {"message": "Products uploaded successfully"}

@router.get("/products/export-csv")
async def export_products_csv(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.is_deleted == False).all()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "name", "description", "price", "category_id", "brand"])
    for p in products:
        writer.writerow([p.id, p.name, p.description, p.price, p.category_id, p.brand])
    output.seek(0)
    return Response(content=output.read(), media_type="text/csv")

@router.get("/")
async def get_products(
    category_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all products with optional category filtering"""
    try:
        # Start with a base query
        query = db.query(Product)
        
        # If category_id is provided, filter products by category
        if category_id:
            try:
                # Convert to int - important for filtering!
                category_id_int = int(category_id)
                query = query.filter(Product.category_id == category_id_int)
                print(f"Filtering products by category_id: {category_id_int}")
            except ValueError:
                print(f"Invalid category_id: {category_id}, not applying filter")
        
        products = query.all()
        print(f"Found {len(products)} products")
        
        # Format response
        return [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": float(p.price),
                "stock": p.stock,
                "category_id": p.category_id,
                "brand": p.brand
            }
            for p in products
        ]
    except Exception as e:
        print(f"Error in get_products: {str(e)}")
        import traceback
        traceback.print_exc()
        return []
