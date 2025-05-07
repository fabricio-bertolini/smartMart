from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Product, Sale
import csv
from io import StringIO
from fastapi.responses import StreamingResponse
from datetime import datetime

router = APIRouter()

@router.get("/products/export")
async def export_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=["name", "price", "cost", "stock", "category"])
    writer.writeheader()
    for product in products:
        writer.writerow({
            "name": product.name,
            "price": product.price,
            "cost": product.cost,
            "stock": product.stock,
            "category": product.category.name if product.category else ""
        })
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=products_{datetime.now().date()}.csv"}
    )
