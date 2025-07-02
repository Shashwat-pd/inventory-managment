
from sqlalchemy.orm import Session
from typing import List

from models.product import Product as ProductModel
from app.schemas.product import ProductCreate

def get_product(db: Session, product_id: str) -> ProductModel | None:
    return db.query(ProductModel).filter(ProductModel.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[ProductModel]:
    return db.query(ProductModel).offset(skip).limit(limit).all()

def create_product(db: Session, prod: ProductCreate) -> ProductModel:
    db_prod = ProductModel(**prod.dict())
    db.add(db_prod)
    db.commit()
    db.refresh(db_prod)
    return db_prod

def update_product(db: Session, product_id: str, prod: ProductCreate) -> ProductModel | None:
    db_prod = get_product(db, product_id)
    if not db_prod:
        return None
    for field, value in prod.dict().items():
        setattr(db_prod, field, value)
    db.commit()
    db.refresh(db_prod)
    return db_prod

def delete_product(db: Session, product_id: str) -> ProductModel | None:
    db_prod = get_product(db, product_id)
    if not db_prod:
        return None
    db.delete(db_prod)
    db.commit()
    return db_prod

