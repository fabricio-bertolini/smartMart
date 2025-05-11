"""
Exports API Routes Module

This module defines the FastAPI routes for data export operations.
It provides endpoints to export various data types (products, categories, sales)
in different formats (CSV, JSON) for integration with other systems or for backup purposes.

Routes:
- GET /exports/products/csv: Export products data in CSV format
- GET /exports/categories/csv: Export categories data in CSV format
- GET /exports/sales/csv: Export sales data in CSV format
- GET /exports/combined/csv: Export combined data with product and sales information
"""

from fastapi import APIRouter, Depends, HTTPException, Response, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta, date
from io import StringIO
import csv
import json
from ..database import get_db
from ..models.models import Product, Category, Sale

# Define the router with prefix
router = APIRouter(prefix="/exports", tags=["exports"])

@router.get("/products/csv")
async def export_products_csv(
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Export products data in CSV format.
    
    Generates a CSV file containing product data with optional filtering by category.
    The CSV includes headers for all relevant product fields.
    
    Args:
        category_id: Optional filter to export only products from a specific category
        db: Database session dependency
        
    Returns:
        StreamingResponse: CSV file as a downloadable response
    """
    # Create a StringIO object to write CSV data
    output = StringIO()
    writer = csv.writer(output)
    
    # Write CSV header row
    writer.writerow(["id", "name", "description", "price", "category_id", "brand"])
    
    # Query products with optional category filter
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    # Write product data rows
    for product in query.all():
        writer.writerow([
            product.id,
            product.name,
            product.description,
            product.price,
            product.category_id,
            product.brand
        ])
    
    # Prepare the response with appropriate headers
    output.seek(0)  # Reset file pointer to beginning
    
    # Define the current timestamp for filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=products_{timestamp}.csv"
        }
    )

@router.get("/categories/csv")
async def export_categories_csv(db: Session = Depends(get_db)):
    """
    Export categories data in CSV format.
    
    Generates a CSV file containing all category data.
    The CSV includes headers for all relevant category fields.
    
    Args:
        db: Database session dependency
        
    Returns:
        StreamingResponse: CSV file as a downloadable response
    """
    # Create a StringIO object to write CSV data
    output = StringIO()
    writer = csv.writer(output)
    
    # Write CSV header row
    writer.writerow(["id", "name"])
    
    # Write category data rows
    for category in db.query(Category).all():
        writer.writerow([
            category.id,
            category.name
        ])
    
    # Prepare the response with appropriate headers
    output.seek(0)  # Reset file pointer to beginning
    
    # Define the current timestamp for filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=categories_{timestamp}.csv"
        }
    )

@router.get("/sales/csv")
async def export_sales_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    product_id: Optional[int] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Export sales data in CSV format.
    
    Generates a CSV file containing sales data with optional filtering by date range,
    product, or category. The CSV includes headers for all relevant sales fields.
    
    Args:
        start_date: Optional filter for sales on or after this date
        end_date: Optional filter for sales on or before this date
        product_id: Optional filter for sales of a specific product
        category_id: Optional filter for sales in a specific category
        db: Database session dependency
        
    Returns:
        StreamingResponse: CSV file as a downloadable response
    """
    # Create a StringIO object to write CSV data
    output = StringIO()
    writer = csv.writer(output)
    
    # Write CSV header row
    writer.writerow(["id", "product_id", "quantity", "total_price", "date"])
    
    # Build the query with filters
    query = db.query(Sale)
    
    if start_date:
        query = query.filter(Sale.date >= start_date)
    
    if end_date:
        query = query.filter(Sale.date <= end_date)
    
    if product_id:
        query = query.filter(Sale.product_id == product_id)
    
    if category_id:
        query = query.join(Product).filter(Product.category_id == category_id)
    
    # Write sales data rows
    for sale in query.all():
        writer.writerow([
            sale.id,
            sale.product_id,
            sale.quantity,
            sale.total_price,
            sale.date.isoformat()
        ])
    
    # Prepare the response with appropriate headers
    output.seek(0)  # Reset file pointer to beginning
    
    # Define the current timestamp for filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=sales_{timestamp}.csv"
        }
    )

@router.get("/combined/csv")
async def export_combined_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Export combined product and sales data in CSV format.
    
    Generates a CSV file with joined data containing product information along with
    sales data. The CSV includes product details and sales metrics for reporting.
    
    Args:
        start_date: Optional filter for sales on or after this date
        end_date: Optional filter for sales on or before this date
        category_id: Optional filter for a specific product category
        db: Database session dependency
        
    Returns:
        StreamingResponse: CSV file as a downloadable response
    """
    # Create a StringIO object to write CSV data
    output = StringIO()
    writer = csv.writer(output)
    
    # Write CSV header row
    writer.writerow([
        "product_id", "product_name", "product_brand", "category_name",
        "total_quantity_sold", "total_revenue", "average_price"
    ])
    
    # Build the base query
    query = db.query(
        Product.id,
        Product.name,
        Product.brand,
        Category.name.label("category_name"),
        func.sum(Sale.quantity).label("total_quantity"),
        func.sum(Sale.total_price).label("total_revenue"),
        func.avg(Sale.total_price / Sale.quantity).label("average_price")
    ).join(
        Sale, Product.id == Sale.product_id
    ).join(
        Category, Product.category_id == Category.id
    )
    
    # Apply filters
    if start_date:
        query = query.filter(Sale.date >= start_date)
    
    if end_date:
        query = query.filter(Sale.date <= end_date)
    
    if category_id:
        query = query.filter(Category.id == category_id)
    
    # Group by product
    query = query.group_by(
        Product.id,
        Product.name,
        Product.brand,
        Category.name
    )
    
    # Write data rows
    for result in query.all():
        writer.writerow([
            result.id,
            result.name,
            result.brand,
            result.category_name,
            result.total_quantity,
            result.total_revenue,
            result.average_price
        ])
    
    # Prepare the response with appropriate headers
    output.seek(0)  # Reset file pointer to beginning
    
    # Define the current timestamp for filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=sales_report_{timestamp}.csv"
        }
    )
