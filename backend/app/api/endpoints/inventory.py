from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import SessionLocal
from app.schemas.product import ProductCreate, ProductOut
from app.crud import product as crud_product
from typing import List

import app.crud.inventory as crud
from app.schemas.inventory import InventoryCreate, InventoryOut

from db.get_db import get_db
router = APIRouter()

@router.post("/", response_model=InventoryOut)
def create_inventory_route(
    inv: InventoryCreate, db: Session = Depends(get_db)
):
    return crud.create_inventory(db, inv)


@router.get("/", response_model=List[InventoryOut])
def list_inventories(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    return crud.get_inventories(db, skip, limit)

@router.get("/{product_id}", response_model=ProductOut)
def read_one(product_id: int, db: Session = Depends(get_db)):
    product = crud_product.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail = "Product not found")
    return product
@router.get("/{store_id}/{product_id}", response_model=InventoryOut)
def read_inventory(
    store_id: int, product_id: str, db: Session = Depends(get_db)
):
    obj = crud.get_inventory(db, store_id, product_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return obj


@router.put("/{store_id}/{product_id}", response_model=InventoryOut)
def update_inventory_route(
    store_id: int,
    product_id: str,
    inv: InventoryCreate,
    db: Session = Depends(get_db),
):
    updated = crud.update_inventory(db, store_id, product_id, inv.stock_level)
    if not updated:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return updated

@router.delete("/{store_id}/{product_id}", response_model=InventoryOut)
def delete_inventory_route(
    store_id: int, product_id: str, db: Session = Depends(get_db)
):
    deleted = crud.delete_inventory(db, store_id, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return deleted

