from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from models.department import Department
from app.schemas.department import DepartmentOut
from app.schemas.store_department import (
    StoreDepartmentCreate,
    StoreDepartmentOut,
)
from app.crud.store_department import (
    add_department_to_store,
    get_departments_for_store,
)
router = APIRouter()
@router.post("/stores/{store_id}/departments/", response_model=StoreDepartmentOut)
def attach_dept_to_store(
    store_id: int,
    data: StoreDepartmentCreate,
    db: Session = Depends(get_db),
):
    # ensure data.store_id == store_id, then:
    return add_department_to_store(db, data)

@router.get("/stores/{store_id}/departments/", response_model=List[DepartmentOut])
def list_depts_in_store(store_id: int, db: Session = Depends(get_db)):
    links = get_departments_for_store(db, store_id)
    # fetch the actual Department objects:
    dept_ids = [l.department_id for l in links]
    return db.query(Department).filter(Department.id.in_(dept_ids)).all()

