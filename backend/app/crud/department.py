
from sqlalchemy.orm import Session
from models.department import Department 
from app.schemas.department import DepartmentCreate

def create_department(db:Session, data:DepartmentCreate):
    department = Department(**data.dict())
    db.add(department)
    db.commit()
    db.refresh(department)
    return department

def get_departments(db: Session):
    return db.query(Department).all()


