from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.database import get_db
import app.crud.weekly_sales as crud
from app.schemas.weekly_sales import WeeklySalesCreate, WeeklySalesBase as WeeklySalesOut

router = APIRouter(prefix="/weekly_sales", tags=["weekly_sales"])

@router.post("/", response_model=WeeklySalesOut)
def create_weekly_sales(ws: WeeklySalesCreate, db: Session = Depends(get_db)):
    existing = crud.get_weekly_sales(
        db, ws.store_id, ws.department_id, ws.week_date
    )
    if existing:
        raise HTTPException(status_code=400, detail="Entry already exists")
    return crud.create_weekly_sales(db, ws)

@router.get("/", response_model=List[WeeklySalesOut])
def list_weekly_sales(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    return crud.get_all_weekly_sales(db, skip, limit)

@router.get("/{store_id}/{department_id}/{week_date}", response_model=WeeklySalesOut)
def read_weekly_sales(
    store_id: int,
    department_id: int,
    week_date: date,
    db: Session = Depends(get_db)
):
    obj = crud.get_weekly_sales(db, store_id, department_id, week_date)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj

@router.put("/{store_id}/{department_id}/{week_date}", response_model=WeeklySalesOut)
def update_weekly_sales_route(
    store_id: int,
    department_id: int,
    week_date: date,
    ws: WeeklySalesCreate,
    db: Session = Depends(get_db)
):
    updated = crud.update_weekly_sales(
        db, store_id, department_id, week_date, ws
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Record not found")
    return updated

@router.delete("/{store_id}/{department_id}/{week_date}", response_model=WeeklySalesOut)
def delete_weekly_sales_route(
    store_id: int,
    department_id: int,
    week_date: date,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_weekly_sales(
        db, store_id, department_id, week_date
    )
    if not deleted:
        raise HTTPException(status_code=404, detail="Record not found")
    return deleted

