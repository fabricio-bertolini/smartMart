from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..models.models import Category
from ..database import get_db
from pydantic import BaseModel

class CategoryCreate(BaseModel):
    name: str

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("/")
async def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    db_category = Category(name=category.name)
    db.add(db_category)
    db.commit()
    return db_category

@router.get("/")
async def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()
