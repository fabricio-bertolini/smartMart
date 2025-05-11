from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Product, Category
import pandas as pd
from io import StringIO
import csv

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
