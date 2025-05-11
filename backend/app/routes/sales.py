"""
Sales API Routes Module

This module defines the FastAPI routes for sales operations.
It handles listing, retrieving, creating, and analyzing sales data,
as well as generating sales statistics and reports.

Routes:
- GET /sales: List all sales with optional filtering
- GET /sales/{sale_id}: Get a specific sale record by ID
- POST /sales: Record a new sale
- GET /sales/stats: Get sales statistics with optional filtering
- GET /sales/years: Get list of years with recorded sales
- GET /sales/monthly/{year}: Get monthly sales breakdown for a specific year
"""

from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from ..models.models import Sale, Product, Category
from ..database import get_db
from datetime import datetime, timedelta
import csv
from io import StringIO
from sqlalchemy import func, extract
import pandas as pd
from typing import Optional
import random
from fastapi.middleware.cors import CORSMiddleware

router = APIRouter(prefix="/sales", tags=["sales"])

@router.get("/")
async def get_sales(db: Session = Depends(get_db)):
    sales = db.query(Sale).all()
    return [
        {
            "id": s.id,
            "product_id": s.product_id,
            "quantity": s.quantity,
            "total_price": s.total_price,
            "date": s.date.isoformat()
        }
        for s in sales
    ]

@router.post("/")
async def create_sale(sale: dict, db: Session = Depends(get_db)):
    required_fields = {"product_id", "quantity", "total_price", "date"}
    if not all(field in sale for field in required_fields):
        raise HTTPException(status_code=400, detail="Missing required fields")
    db_sale = Sale(
        product_id=sale["product_id"],
        quantity=sale["quantity"],
        total_price=sale["total_price"],
        date=datetime.fromisoformat(sale["date"]).date()
    )
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return {
        "id": db_sale.id,
        "product_id": db_sale.product_id,
        "quantity": db_sale.quantity,
        "total_price": db_sale.total_price,
        "date": db_sale.date.isoformat()
    }

@router.put("/{sale_id}")
async def update_sale(sale_id: int, updates: dict, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    for key in ["product_id", "quantity", "total_price", "date"]:
        if key in updates:
            if key == "date":
                setattr(sale, key, datetime.fromisoformat(updates[key]).date())
            else:
                setattr(sale, key, updates[key])
    db.commit()
    db.refresh(sale)
    return {
        "id": sale.id,
        "product_id": sale.product_id,
        "quantity": sale.quantity,
        "total_price": sale.total_price,
        "date": sale.date.isoformat()
    }

@router.get("/export")
async def export_sales(db: Session = Depends(get_db)):
    sales = db.query(Sale).all()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "product_id", "quantity", "total_price", "date"])
    for s in sales:
        writer.writerow([s.id, s.product_id, s.quantity, s.total_price, s.date.isoformat()])
    output.seek(0)
    return Response(content=output.read(), media_type="text/csv")

@router.get("/monthly")
async def get_monthly_sales(year: int = datetime.now().year, category_id: int = None, db: Session = Depends(get_db)):
    try:
        # Prepare months 1-12 with default 0
        sales = {str(i): {"total_price": 0} for i in range(1, 13)}
        total = 0
        orders = 0

        # Build query
        query = db.query(
            Sale,
            func.extract('month', Sale.date).label('month'),
            func.sum(Sale.total_price).label('total_price'),
            func.sum(Sale.quantity).label('orders')
        ).filter(func.extract('year', Sale.date) == year)

        if category_id:
            query = query.join(Product, Sale.product_id == Product.id)
            query = query.filter(Product.category_id == category_id)

        query = query.group_by('month')
        results = query.all()

        for _, month, total_price, order_count in results:
            month_str = str(int(month))
            sales[month_str] = {"total_price": float(total_price or 0)}
            total += float(total_price or 0)
            orders += int(order_count or 0)

        return {
            "sales": sales,
            "total": total,
            "orders": orders
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-category")
async def get_sales_by_category(db: Session = Depends(get_db)):
    sales = db.query(
        Category.name,
        func.sum(Sale.total_price).label("total")
    ).select_from(Sale)\
    .join(Product, Sale.product_id == Product.id)\
    .join(Category, Product.category_id == Category.id)\
    .group_by(Category.name)\
    .all()
    
    return {
        "labels": [s.name for s in sales],
        "datasets": [{
            "data": [float(s.total) for s in sales]
        }]
    }

@router.get("/stats")
async def get_sales_stats(year: int = datetime.now().year, category_id: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        # Initialize monthly data structure
        monthly_data = {str(i): {"orders": 0, "total_price": 0, "profit": 0} for i in range(1, 13)}
        
        # Build base query with monthly aggregation
        query = db.query(
            func.extract('month', Sale.date).label('month'),
            func.count(Sale.id).label('orders'),
            func.sum(Sale.total_price).label('total_price')
        ).filter(
            func.extract('year', Sale.date) == year
        ).group_by('month')

        # Add category filter if provided
        if category_id and category_id.strip():
            query = query.join(Product).filter(Product.category_id == int(category_id))

        # Execute query and process results
        results = query.all()
        total_sales = 0
        total_orders = 0
        
        for result in results:
            month = str(int(result.month))
            orders = int(result.orders)
            total_price = float(result.total_price or 0)
            profit = total_price * 0.3  # Calculate profit as 30% of sales
            
            monthly_data[month] = {
                "orders": orders,
                "total_price": total_price,
                "profit": profit
            }
            
            total_sales += total_price
            total_orders += orders

        return {
            "sales": monthly_data,
            "total": total_sales,
            "orders": total_orders,
            "total_profit": total_sales * 0.3
        }

    except Exception as e:
        print(f"Error in get_sales_stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/years")
async def get_sales_years(db: Session = Depends(get_db)):
    years = db.query(func.extract('year', Sale.date).label("year")).distinct().order_by("year").all()
    return [int(y.year) for y in years if y.year is not None]

@router.post("/import/csv")
async def import_csv(
    file: UploadFile = File(...),
    type: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        df = pd.read_csv(StringIO(content.decode('utf-8')))

        required_columns = {'product_id', 'quantity', 'total_price', 'date'}
        if not required_columns.issubset(df.columns):
            raise HTTPException(status_code=400, detail="Sales CSV missing required columns")

        sales = []
        for idx, row in df.iterrows():
            try:
                if any(pd.isna(row[col]) for col in required_columns):
                    continue
                try:
                    product_id = int(row['product_id'])
                    quantity = int(row['quantity'])
                    total_price = float(row['total_price'])
                    date = datetime.strptime(str(row['date']), '%Y-%m-%d').date()
                    if quantity <= 0:
                        continue
                    if total_price <= 0:
                        continue
                    product = db.query(Product).get(product_id)
                    if not product:
                        continue
                    sale = Sale(
                        product_id=product_id,
                        quantity=quantity,
                        total_price=total_price,
                        date=date
                    )
                    sales.append(sale)
                    db.add(sale)
                except ValueError:
                    continue
            except Exception:
                continue

        if not sales:
            raise HTTPException(status_code=400, detail="No valid sales to import")

        db.commit()
        return {"message": f"Successfully imported {len(sales)} sales records"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
