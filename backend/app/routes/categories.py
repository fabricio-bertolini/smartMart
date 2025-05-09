from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..models.models import Category
from ..database import get_db
from pydantic import BaseModel

class CategoryCreate(BaseModel):
    name: str

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("/")
async def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    if db.query(Category).filter(Category.name == category.name).first():
        raise HTTPException(status_code=400, detail="Category already exists")
    db_category = Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return {"id": db_category.id, "name": db_category.name}

@router.get("/")
async def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return [{"id": c.id, "name": c.name} for c in categories]
