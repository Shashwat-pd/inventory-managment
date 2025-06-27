from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import SessionLocal
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

@router.get("/{product_id}", response_model=ProductOut)
def read_one(product_id: int, db: Session = Depends(get_db)):
    product = crud_product.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail = "Product not found")
    return product

@router.put("/{product_id}", response_model = ProductOut)
def update(product_id:int, product:ProductCreate, db: Session = Depends(get_db)):
    updated = crud_product.update_product(db, product_id, product)
    if not updated:
        raise HTTPException(status_code=404, detail = "Product not found")
    return updated

@router.delete("/{product_id}")
def delete(product_id: int , db: Session = Depends(get_db)):
    deleted = crud_product.delete_product(db, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"detail" : f"Product {product_id} deleted successfully"}


