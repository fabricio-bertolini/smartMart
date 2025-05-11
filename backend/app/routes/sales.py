from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..models.models import Sale, Product, Category
from ..database import get_db
from datetime import datetime, timedelta
import csv
from io import StringIO
from sqlalchemy import func
import pandas as pd

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
async def get_monthly_sales(year: int = datetime.now().year, db: Session = Depends(get_db)):
    try:
        sales = db.query(Sale)\
            .filter(Sale.date.between(f"{year}-01-01", f"{year}-12-31"))\
            .all()
        
        months = ["January", "February", "March", "April", "May", "June",
                 "July", "August", "September", "October", "November", "December"]
        
        data = {month: {"quantity": 0, "total_price": 0} for month in months}
        
        for sale in sales:
            month = sale.date.strftime("%B")
            data[month]["quantity"] += sale.quantity
            data[month]["total_price"] += float(sale.total_price)
        
        return {
            "labels": months,
            "datasets": [{
                "label": "Monthly Sales",
                "data": [data[month]["total_price"] for month in months]
            }]
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
async def get_sales_stats(db: Session = Depends(get_db)):
    try:
        year_ago = datetime.now() - timedelta(days=365)
        sales = db.query(Sale)\
            .join(Product)\
            .filter(Sale.date >= year_ago)\
            .all()
        
        monthly_stats = {}
        
        for sale in sales:
            month = sale.date.strftime("%B %Y")
            if month not in monthly_stats:
                monthly_stats[month] = {"quantity": 0, "profit": 0}
                
            monthly_stats[month]["quantity"] += sale.quantity
            profit = sale.total_price - (sale.product.cost * sale.quantity)
            monthly_stats[month]["profit"] += profit
            
        return monthly_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
