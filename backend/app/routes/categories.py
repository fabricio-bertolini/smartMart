"""
Categories API Routes Module

This module defines the FastAPI routes for category management operations.
It provides endpoints for listing, retrieving, creating, updating, and
deleting product categories, as well as retrieving products by category.

Routes:
- GET /categories: List all categories
- GET /categories/{category_id}: Get a specific category by ID
- POST /categories: Create a new category
- PUT /categories/{category_id}: Update an existing category
- DELETE /categories/{category_id}: Delete a category
- GET /categories/{category_id}/products: Get products in a specific category
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.models import Category, Product
from pydantic import BaseModel, Field, validator

# Define the router
router = APIRouter()

# Pydantic models for request/response validation
class CategoryBase(BaseModel):
    """
    Base Pydantic model for category data validation.
    
    Contains the name field which is required for both creation and updates.
    """
    name: str = Field(..., min_length=2, max_length=100, description="Category name")

class CategoryCreate(CategoryBase):
    """Pydantic model for creating a new category."""
    pass

class CategoryUpdate(CategoryBase):
    """Pydantic model for updating an existing category."""
    pass

class CategoryResponse(CategoryBase):
    """
    Pydantic model for category responses.
    
    Includes all fields from CategoryBase plus the database ID.
    """
    id: int
    
    class Config:
        """Configuration for Pydantic to convert ORM objects to models."""
        orm_mode = True

class ProductInCategory(BaseModel):
    """
    Simplified Pydantic model for product information when listed in a category.
    
    Contains only the essential product fields needed for category-based listings.
    """
    id: int
    name: str
    price: float
    brand: str
    
    class Config:
        """Configuration for Pydantic to convert ORM objects to models."""
        orm_mode = True

@router.get("/categories", response_model=List[CategoryResponse], tags=["Categories"])
async def get_categories(db: Session = Depends(get_db)):
    """
    Get a list of all categories.
    
    Args:
        db: Database session dependency
        
    Returns:
        List of all categories
    """
    categories = db.query(Category).all()
    return categories

@router.get("/categories/{category_id}", response_model=CategoryResponse, tags=["Categories"])
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """
    Get a specific category by ID.
    
    Args:
        category_id: The ID of the category to retrieve
        db: Database session dependency
        
    Returns:
        The requested category details
        
    Raises:
        HTTPException: If category with specified ID is not found
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found"
        )
    return category

@router.post("/categories", response_model=CategoryResponse, tags=["Categories"])
async def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """
    Create a new category.
    
    Args:
        category: CategoryCreate model with category details
        db: Database session dependency
        
    Returns:
        The newly created category with assigned ID
        
    Raises:
        HTTPException: If a category with the same name already exists
    """
    # Check if category with the same name already exists
    existing_category = db.query(Category).filter(Category.name == category.name).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with name '{category.name}' already exists"
        )
    
    # Create new category instance
    db_category = Category(name=category.name)
    
    try:
        # Add to database and commit
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category
    except IntegrityError as e:
        # Handle unique constraint violations
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category could not be created due to constraint violation"
        )
    except SQLAlchemyError as e:
        # Handle other database errors
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )

@router.put("/categories/{category_id}", response_model=CategoryResponse, tags=["Categories"])
async def update_category(category_id: int, category_update: CategoryUpdate, db: Session = Depends(get_db)):
    """
    Update an existing category.
    
    Args:
        category_id: The ID of the category to update
        category_update: CategoryUpdate model with fields to update
        db: Database session dependency
        
    Returns:
        The updated category details
        
    Raises:
        HTTPException: If category not found, name already exists, or database error
    """
    # Get existing category
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found"
        )
    
    # Check if another category already has the requested name
    existing_category = db.query(Category).filter(
        Category.name == category_update.name,
        Category.id != category_id
    ).first()
    
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with name '{category_update.name}' already exists"
        )
    
    # Update category name
    db_category.name = category_update.name
    
    try:
        # Commit changes
        db.commit()
        db.refresh(db_category)
        return db_category
    except SQLAlchemyError as e:
        # Handle database errors
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )

@router.delete("/categories/{category_id}", tags=["Categories"])
async def delete_category(category_id: int, force: bool = False, db: Session = Depends(get_db)):
    """
    Delete a category.
    
    Args:
        category_id: The ID of the category to delete
        force: If True, delete category and all associated products
              If False, fail if category has associated products
        db: Database session dependency
        
    Returns:
        JSON response indicating successful deletion
        
    Raises:
        HTTPException: If category not found, has products, or database error
    """
    # Get existing category
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found"
        )
    
    # Check if category has associated products
    product_count = db.query(Product).filter(Product.category_id == category_id).count()
    if product_count > 0 and not force:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category has {product_count} associated products. Set force=true to delete anyway."
        )
    
    try:
        # Delete the category (and associated products if force=True)
        if force and product_count > 0:
            # Delete associated products first
            db.query(Product).filter(Product.category_id == category_id).delete()
        
        # Then delete the category
        db.delete(db_category)
        db.commit()
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": f"Category with ID {category_id} deleted successfully",
                "deleted_products": product_count if force else 0
            }
        )
    except SQLAlchemyError as e:
        # Handle database errors
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while deleting category"
        )

@router.get("/categories/{category_id}/products", response_model=List[ProductInCategory], tags=["Categories"])
async def get_products_by_category(category_id: int, db: Session = Depends(get_db)):
    """
    Get all products in a specific category.
    
    Args:
        category_id: The ID of the category to get products for
        db: Database session dependency
        
    Returns:
        List of products in the specified category
        
    Raises:
        HTTPException: If category not found
    """
    # Verify category exists
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found"
        )
    
    # Get products in category
    products = db.query(Product).filter(Product.category_id == category_id).all()
    return products
