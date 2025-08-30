from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from db.get_db import get_db
from app.crud.forecast import (
    get_forecast,
    get_forecasts,
    get_forecasts_by_store_department,
)
from app.schemas.forecast import ForecastCreate, ForecastOut

router = APIRouter()

@router.get("/", response_model=List[ForecastOut])
def list_forecasts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return get_forecasts(db, skip, limit)

@router.get(
    "/{store_id}/{department_id}/{week_date}",
    response_model=ForecastOut,
)
def read_forecast(
    store_id: int,
    department_id: int,
    week_date: date,
    db: Session = Depends(get_db),
):
    obj = get_forecast(db, store_id, department_id, week_date)
    if not obj:
        raise HTTPException(status_code=404, detail="Forecast not found")
    return obj

@router.get(
    "/{store_id}/{department_id}",
    response_model=List[ForecastOut],
)
def list_forecasts_by_store_department(
    store_id: int,
    department_id: int,
    skip: int = 0,
    limit: int | None = None,
    db: Session = Depends(get_db),
):
    return get_forecasts_by_store_department(db, store_id, department_id, skip, limit)

