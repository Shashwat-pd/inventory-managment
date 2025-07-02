from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.database import get_db
from app.crud.forecast import (
    get_forecast,
    get_forecasts,
    create_forecast,
)
from app.schemas.forecast import ForecastCreate, ForecastOut

router = APIRouter(prefix="/forecasts", tags=["forecasts"])

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


