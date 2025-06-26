from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.schemas.product import ProductCreate, ProductOut
from app.crud import product as crud_product

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ProductOut)
def create(product: ProductCreate, db: Session = Depends(get_db)):
    return crud_product.create_product(db, product)

@router.get("/", response_model=list[ProductOut])
def read_all(db: Session = Depends(get_db)):
    return crud_product.get_products(db)

