from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.models import Sale, Product, Category
from ..database import get_db
from datetime import date, datetime
import csv
from io import StringIO

router = APIRouter(prefix="/sales", tags=["sales"])

@router.get("/")
async def get_sales(db: Session = Depends(get_db)):
    return db.query(Sale).all()

@router.post("/{product_id}")
async def create_sale(product_id: int, quantity: int, total_price: float, db: Session = Depends(get_db)):
    sale = Sale(product_id=product_id, quantity=quantity, total_price=total_price, date=date.today())
    db.add(sale)
    db.commit()
    return sale

@router.put("/{sale_id}")
async def update_sale(sale_id: int, updates: dict, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    for key, value in updates.items():
        setattr(sale, key, value)
    
    if "quantity" in updates:
        sale.total_price = sale.product.price * updates["quantity"]
    
    db.commit()
    return sale

@router.get("/export")
async def export_sales(db: Session = Depends(get_db)):
    sales = db.query(Sale).all()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Product ID", "Quantity", "Total Price", "Date"])
    for sale in sales:
        writer.writerow([sale.id, sale.product_id, sale.quantity, sale.total_price, sale.date])
    
    response = Response(content=output.getvalue())
    response.headers["Content-Disposition"] = "attachment; filename=sales.csv"
    response.headers["Content-Type"] = "text/csv"
    return response

@router.get("/monthly")
async def get_monthly_sales(year: int = datetime.now().year, db: Session = Depends(get_db)):
    sales = db.query(Sale)\
        .filter(Sale.date.between(f"{year}-01-01", f"{year}-12-31"))\
        .all()
    
    monthly_data = {}
    for sale in sales:
        month = sale.date.strftime("%B")  # Month name
        if month not in monthly_data:
            monthly_data[month] = {"quantity": 0, "profit": 0}
        monthly_data[month]["quantity"] += sale.quantity
        monthly_data[month]["profit"] += sale.profit
    
    return monthly_data

@router.get("/by-category")
async def get_sales_by_category(db: Session = Depends(get_db)):
    sales = db.query(
        Category.name,
        func.sum(Sale.total_price).label("total")
    ).join(Product).join(Category).group_by(Category.name).all()
    return {
        "labels": [s.name for s in sales],
        "datasets": [{
            "data": [float(s.total) for s in sales]
        }]
    }
