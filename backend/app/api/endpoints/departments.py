from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.department import DepartmentCreate, DepartmentOut
from db.session import SessionLocal
from app.crud import department as crud

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=DepartmentOut)
def create(data: DepartmentCreate, db: Session = Depends(get_db)):
    return crud.create_department(db, data)

@router.get("/", response_model=list[DepartmentOut])
def read_all(db: Session = Depends(get_db)):
    return crud.get_departments(db)

