from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.store import StoreCreate, StoreOut
from app.crud import store as crud

from db.get_db import get_db
router = APIRouter()

@router.post("/", response_model=StoreOut)
def create(data: StoreCreate, db: Session = Depends(get_db)):
    return crud.create_store(db, data)

@router.get("/", response_model=list[StoreOut])
def read_all(db: Session = Depends(get_db)):
    return crud.get_stores(db)

