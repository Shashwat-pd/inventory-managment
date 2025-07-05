from sqlalchemy.orm import Session
from models.inventory import Inventory
from app.schemas.inventory import InventoryCreate

def get_inventory(db: Session, store_id: int,department_id:int, product_id: int):
    return (
        db.query(Inventory)
        .filter(
            Inventory.store_id == store_id,
            Inventory.department_id == department_id,
            Inventory.product_id == product_id
        )
        .first()
    )

def get_inventories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Inventory).offset(skip).limit(limit).all()

def create_inventory(db: Session, inv: InventoryCreate):
    obj = Inventory(**inv.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def update_inventory(db: Session, store_id: int, department_id: int,product_id: int, stock_level: int):
    obj = get_inventory(db, store_id, department_id, product_id)
    if not obj:
        return None
    obj.stock_level = stock_level
    db.commit()
    db.refresh(obj)
    return obj

def delete_inventory(db: Session, store_id: int, department_id: int, product_id: int):
    obj = get_inventory(db, store_id, department_id, product_id)
    if not obj:
        return None
    db.delete(obj)
    db.commit()
    return obj

