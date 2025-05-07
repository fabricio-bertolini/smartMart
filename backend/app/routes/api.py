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

@router.post("/categories")
async def create_category(category: dict, db: Session = Depends(get_db)):
    try:
        db_category = Category(name=category["name"])
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/products/csv")
async def upload_products_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        df = pd.read_csv(file.file)
        required_columns = ['name', 'price', 'category_id']
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(
                status_code=400, 
                detail=f"CSV must contain columns: {', '.join(required_columns)}"
            )
        
        products = []
        for _, row in df.iterrows():
            product = Product(**row.to_dict())
            db.add(product)
            products.append(product)
        
        db.commit()
        return {
            "message": f"Successfully imported {len(products)} products",
            "products": products
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sales/stats")
async def get_sales_stats(db: Session = Depends(get_db)):
    year_ago = datetime.now() - timedelta(days=365)
    sales = db.query(Sale).filter(Sale.transaction_date >= year_ago).all()
    
    stats = {}
    for sale in sales:
        month = sale.transaction_date.strftime("%B %Y")
        if month not in stats:
            stats[month] = {
                "quantity": 0,
                "profit": 0
            }
        stats[month]["quantity"] += sale.quantity
        stats[month]["profit"] += float(sale.profit)
    
    return stats

@router.get("/stats")
async def get_sales_stats(db: Session = Depends(get_db)):
    try:
        year_ago = datetime.now() - timedelta(days=365)
        sales = db.query(Sale).filter(Sale.date >= year_ago).all()
        monthly_stats = {}
        
        for sale in sales:
            month = sale.date.strftime("%B %Y")  # Format: "January 2024"
            if month not in monthly_stats:
                monthly_stats[month] = {"quantity": 0, "profit": 0}
            monthly_stats[month]["quantity"] += sale.quantity
            profit = (sale.total_price - (sale.product.cost * sale.quantity))
            monthly_stats[month]["profit"] += profit
        
        return monthly_stats
    except Exception as e:
        return {"error": str(e)}

@router.get("/products/export-csv")
async def export_products_csv(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "name", "price", "cost", "category_id"])
    
    for product in products:
        writer.writerow([
            product.id,
            product.name,
            product.price,
            product.cost,
            product.category_id
        ])
    
    response = StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = "attachment; filename=products.csv"
    return response

@router.get("/sales/export-csv")
async def export_sales_csv(db: Session = Depends(get_db)):
    sales = db.query(Sale).all()
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "product_id", "quantity", "total_price", "date"])
    
    for sale in sales:
        writer.writerow([
            sale.id,
            sale.product_id,
            sale.quantity,
            sale.total_price,
            sale.date.isoformat()
        ])
    
    response = StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = "attachment; filename=sales.csv"
    return response
