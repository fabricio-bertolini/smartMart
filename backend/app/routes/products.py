from fastapi import APIRouter, File, UploadFile, Depends
from sqlalchemy.orm import Session
from ..database import get_db
import pandas as pd
from io import StringIO
import csv
from typing import List
from ..models.models import Product, Category

router = APIRouter()

@router.post("/products/")
async def create_product(product: dict, db: Session = Depends(get_db)):
    db_product = Product(**product)
    db.add(db_product)
    db.commit()
    return db_product

@router.get("/products/")
async def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.is_deleted == False).all()
    return [p.to_dict() for p in products]

@router.post("/products/upload-csv")
async def upload_products_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    df = pd.read_csv(StringIO(contents.decode()))
    products = []
    for _, row in df.iterrows():
        product = Product(**row.to_dict())
        db.add(product)
        products.append(product)
    db.commit()
    return {"message": f"Imported {len(products)} products"}

@router.get("/products/export-csv")
async def export_products_csv(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=["name", "description", "price", "cost", "category_id"])
    writer.writeheader()
    for product in products:
        writer.writerow(product.to_dict())
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment;filename=products.csv"}
    )
