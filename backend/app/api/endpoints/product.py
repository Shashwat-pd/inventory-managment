from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
import app.crud.product as crud
from app.schemas.product import ProductCreate, ProductOut

router = APIRouter(prefix="/products", tags=["products"])

@router.post("/", response_model=ProductOut)
def create_product(
    prod: ProductCreate,
    db: Session = Depends(get_db)
):
    # if you prefer to enforce SKU uniqueness you could check here
    return crud.create_product(db, prod)

@router.get("/", response_model=List[ProductOut])
def list_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_products(db, skip, limit)

@router.get("/{product_id}", response_model=ProductOut)
def read_product(
    product_id: str,
    db: Session = Depends(get_db)
):
    obj = crud.get_product(db, product_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Product not found")
    return obj

@router.put("/{product_id}", response_model=ProductOut)
def update_product_route(
    product_id: str,
    prod: ProductCreate,
    db: Session = Depends(get_db)
):
    obj = crud.update_product(db, product_id, prod)
    if not obj:
        raise HTTPException(status_code=404, detail="Product not found")
    return obj

@router.delete("/{product_id}", response_model=ProductOut)
def delete_product_route(
    product_id: str,
    db: Session = Depends(get_db)
):
    obj = crud.delete_product(db, product_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Product not found")
    return obj

