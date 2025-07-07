from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.department import DepartmentCreate, DepartmentOut
from app.crud import department as crud

from db.get_db import get_db
router = APIRouter()

@router.post("/", response_model=DepartmentOut)
def create(data: DepartmentCreate, db: Session = Depends(get_db)):
    return crud.create_department(db, data)

@router.get("/", response_model=list[DepartmentOut])
def read_all(db: Session = Depends(get_db)):
    return crud.get_departments(db)


