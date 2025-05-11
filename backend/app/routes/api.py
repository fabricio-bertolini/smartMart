from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Query, Body, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Product, Category, Sale
import pandas as pd
from typing import List
import csv
from io import StringIO
from fastapi.responses import StreamingResponse
from datetime import datetime, timedelta
from sqlalchemy import extract, and_
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/products")
async def create_product(product: dict, db: Session = Depends(get_db)):
    """
    Create a new product in the database.
    Expects a dict with name, description, price, category_id, and brand.
    """
    # Create a new product in the database
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

@router.get("/products")
async def list_products(category_id: int = None, db: Session = Depends(get_db)):
    """
    List all products, optionally filtered by category_id.
    Returns a list of product dicts.
    """
    # List all products, optionally filtered by category_id
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    return {"data": [p.to_dict() for p in query.all()]}

@router.get("/categories")
async def list_categories(db: Session = Depends(get_db)):
    """
    List all categories in the database.
    Returns all categories from the PostgreSQL categories table.
    """
    try:
        # Direct query to the categories table
        categories = db.query(Category).all()
        
        # Log the categories for debugging
        print(f"Fetched {len(categories)} categories from database")
        
        # Return categories as array of objects with id and name
        return [{"id": c.id, "name": c.name} for c in categories]
    except Exception as e:
        print(f"Error fetching categories: {str(e)}")
        return {"error": "Failed to fetch categories"}

@router.post("/import/csv") 
async def import_csv(
    file: UploadFile = File(...),
    type: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Import products, categories, or sales from a CSV file.
    The 'type' form field determines which model to import.
    """
    # Import products, categories, or sales from a CSV file
    logger.info(f"Received file upload: {file.filename}, type: {type}")
    
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
        
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="File is empty")
            
        content_str = content.decode()
        if not content_str.strip():
            raise HTTPException(status_code=400, detail="File contains no data")

        df = pd.read_csv(StringIO(content_str))
        if df.empty:
            raise HTTPException(status_code=400, detail="CSV contains no records")

        if 'id' in df.columns:
            df = df.drop(columns=['id'])

        if type == 'sales':
            required_columns = {'product_id', 'quantity', 'total_price', 'date'}
            if not required_columns.issubset(df.columns):
                raise HTTPException(status_code=400, detail="Sales CSV missing required columns")

            sales = []
            invalid_rows = []

            for idx, row in df.iterrows():
                try:
                    if any(pd.isna(row[col]) for col in required_columns):
                        invalid_rows.append(f"Row {idx+1}: Missing required fields")
                        continue

                    product_id = int(row['product_id'])
                    quantity = int(row['quantity'])
                    total_price = float(row['total_price'])
                    date = datetime.strptime(str(row['date']), '%Y-%m-%d').date()

                    if quantity <= 0:
                        invalid_rows.append(f"Row {idx+1}: Quantity must be positive")
                        continue
                    if total_price <= 0:
                        invalid_rows.append(f"Row {idx+1}: Total price must be positive")
                        continue

                    # Check if product_id exists in the database
                    product = db.query(Product).filter(Product.id == product_id).first()
                    if not product:
                        invalid_rows.append(f"Row {idx+1}: Product ID {product_id} does not exist in the database")
                        continue

                    sale = Sale(
                        product_id=product_id,
                        quantity=quantity,
                        total_price=total_price,
                        date=date
                    )
                    sales.append(sale)
                    db.add(sale)

                except Exception as e:
                    invalid_rows.append(f"Row {idx+1}: {str(e)}")
                    continue

            if not sales:
                raise HTTPException(status_code=400, detail=f"No valid sales to import. Errors: {'; '.join(invalid_rows)}")

            try:
                db.commit()
                response = {
                    "message": f"Successfully imported {len(sales)} sales records",
                    "warnings": invalid_rows if invalid_rows else None
                }
                return response
            except Exception as e:
                db.rollback()
                raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

        elif type == 'products':
            product_columns = {'name', 'price', 'category_id', 'description', 'brand'}
            if product_columns.issubset(df.columns):
                invalid_rows = []
                products = []
                
                for idx, row in df.iterrows():
                    try:
                        if any(pd.isna(row[col]) for col in product_columns):
                            invalid_rows.append(f"Row {idx+1}: Missing required fields")
                            continue

                        price = float(row['price'])
                        category_id = int(row['category_id'])
                        if price <= 0:
                            invalid_rows.append(f"Row {idx+1}: Price must be positive")
                            continue
                        if category_id <= 0:
                            invalid_rows.append(f"Row {idx+1}: Invalid category ID")
                            continue

                        product = Product(
                            name=str(row['name']).strip(),
                            description=str(row['description']).strip(),
                            price=price,
                            category_id=category_id,
                            brand=str(row['brand']).strip()
                        )
                        products.append(product)
                        db.add(product)

                    except Exception as e:
                        invalid_rows.append(f"Row {idx+1}: {str(e)}")
                        continue

                if not products:
                    raise HTTPException(status_code=400, detail=f"No valid products to import. Errors: {'; '.join(invalid_rows)}")

                try:
                    db.commit()
                    response = {
                        "message": f"Successfully imported {len(products)} products",
                        "products": [p.name for p in products]
                    }
                    if invalid_rows:
                        response["warnings"] = invalid_rows
                    return response
                except Exception as e:
                    db.rollback()
                    raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

        elif type == 'categories':
            invalid_rows = []
            categories = []
            existing_categories = {c.name.lower(): c for c in db.query(Category).all()}
            
            for idx, row in df.iterrows():
                try:
                    name = str(row['name']).strip()
                    if not name:
                        invalid_rows.append(f"Row {idx+1}: Empty category name")
                        continue
                        
                    name_lower = name.lower()
                    if name_lower in existing_categories:
                        invalid_rows.append(f"Row {idx+1}: Category '{name}' already exists - skipping")
                        continue

                    category = Category(name=name)
                    categories.append(category)
                    existing_categories[name_lower] = category
                    db.add(category)

                except Exception as e:
                    invalid_rows.append(f"Row {idx+1}: {str(e)}")
                    continue

            if not categories:
                message = "No new categories to import."
                if invalid_rows:
                    message += f" Issues found: {'; '.join(invalid_rows)}"
                return {
                    "message": message,
                    "categories": [],
                    "warnings": invalid_rows if invalid_rows else None
                }

            try:
                db.commit()
                response = {
                    "message": f"Successfully imported {len(categories)} categories",
                    "categories": [c.name for c in categories]
                }
                if invalid_rows:
                    response["warnings"] = invalid_rows
                return response
            except Exception as e:
                db.rollback()
                logger.error(f"Database error during category import: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

        else:
            raise HTTPException(status_code=400, detail="Invalid import type")

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error during CSV import")
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
    finally:
        await file.close()

@router.get("/sales/stats")
async def get_sales_stats(
    db: Session = Depends(get_db),
    category_id: int = Query(None),
    year: int = Query(None)
):
    """
    Get monthly sales and profit statistics.
    Optionally filter by category and year.
    """
    # Return monthly sales and profit statistics, optionally filtered by category and year
    try:
        query = db.query(Sale)
        if category_id is not None:
            query = query.join(Product).filter(Product.category_id == category_id)
        sales = query.all()
        monthly_stats = {}
        total_sales = 0
        for sale in sales:
            month = sale.date.strftime("%B %Y")
            if month not in monthly_stats:
                monthly_stats[month] = {"quantity": 0, "total_price": 0}
            monthly_stats[month]["quantity"] += sale.quantity
            # Round each individual sale amount to prevent floating point errors
            sale_amount = round(float(sale.total_price), 2)
            monthly_stats[month]["total_price"] = round(monthly_stats[month]["total_price"] + sale_amount, 2) 
            total_sales = round(total_sales + sale_amount, 2)
            
        if year:
            monthly_stats = {
                k: v for k, v in monthly_stats.items()
                if k.endswith(str(year))
            }
        return {
            "data": monthly_stats,
            "total_sales": total_sales
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/products/export-csv")
async def export_products_csv(db: Session = Depends(get_db)):
    """
    Export all products as a CSV file.
    """
    # Export all products as a CSV file
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
    """
    Export all sales as a CSV file.
    """
    # Export all sales as a CSV file
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

# Add a health check endpoint for frontend connectivity testing

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint that also verifies database connectivity
    Returns success only if both API and database are working
    """
    try:
        # Test database connection by running a simple query
        result = db.execute("SELECT 1").fetchone()
        if result and result[0] == 1:
            # Database connection successful
            return {
                "status": "healthy",
                "message": "API server and database connection are working",
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "status": "unhealthy", 
                "message": "Database query failed", 
                "timestamp": datetime.now().isoformat()
            }
    except Exception as e:
        print(f"Health check failed: {str(e)}")
        return {
            "status": "error",
            "message": f"Database connection error: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }
