from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Product, Category, Sale
import pandas as pd
from typing import List
import csv
from io import StringIO
from fastapi.responses import StreamingResponse
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/products")
async def create_product(product: dict, db: Session = Depends(get_db)):
    db_product = Product(**product)
    db.add(db_product)
    db.commit()
    return db_product

@router.get("/products")
async def list_products(category_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Product).filter(Product.is_deleted == False)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    return query.all()

@router.get("/categories")
async def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/products/csv")
async def upload_products_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    df = pd.read_csv(file.file)
    for _, row in df.iterrows():
        product = Product(**row.to_dict())
        db.add(product)
    db.commit()
    return {"message": "Products imported successfully"}

@router.get("/sales/stats")
async def get_sales_stats(db: Session = Depends(get_db)):
    year_ago = datetime.now() - timedelta(days=365)
    sales = db.query(Sale).filter(Sale.date >= year_ago).all()
    monthly_stats = {}
    for sale in sales:
        month = sale.date.strftime("%Y-%m")
        if month not in monthly_stats:
            monthly_stats[month] = {"quantity": 0, "profit": 0}
        monthly_stats[month]["quantity"] += sale.quantity
        monthly_stats[month]["profit"] += sale.profit
    
    return monthly_stats
