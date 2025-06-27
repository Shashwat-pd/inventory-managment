
from sqlalchemy.orm import Session
from models.store import Store
from app.schemas.store import StoreCreate

def create_store (db:Session, data:StoreCreate):
    store = Store(**data.dict())
    db.add(store)
    db.commit()
    db.refresh(store)
    return store

def get_stores(db: Session):
    return db.query(Store).all()


