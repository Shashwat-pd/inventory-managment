from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.store import StoreCreate, StoreOut
from db.session import SessionLocal
from app.crud import store as crud

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=StoreOut)
def create(data: StoreCreate, db: Session = Depends(get_db)):
    return crud.create_store(db, data)

@router.get("/", response_model=list[StoreOut])
def read_all(db: Session = Depends(get_db)):
    return crud.get_stores(db)

