from sqlalchemy.orm import Session
from models.store_department import StoreDepartment
from app.schemas.store_department import StoreDepartmentCreate

def add_department_to_store(db: Session, data: StoreDepartmentCreate):
    link = StoreDepartment(**data.dict())
    db.add(link)
    db.commit()
    db.refresh(link)
    return link

def get_departments_for_store(db: Session, store_id: int):
    return (
        db.query(StoreDepartment)
          .filter(StoreDepartment.store_id == store_id)
          .all()
    )

