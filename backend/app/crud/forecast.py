from sqlalchemy.orm import Session
from datetime import date

from models.forecast import Forecast as ForecastModel
from app.schemas.forecast import ForecastCreate

def get_forecast(
    db: Session,
    store_id: int,
    department_id: int,
    week_date: date
):
    return (
        db.query(ForecastModel)
          .filter(
              ForecastModel.store_id == store_id,
              ForecastModel.department_id == department_id,
              ForecastModel.week_date     == week_date
          )
          .first()
    )

def get_forecasts(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return db.query(ForecastModel).offset(skip).limit(limit).all()

def get_forecasts_by_store_department(
    db: Session,
    store_id: int,
    department_id: int,
    skip: int = 0,
    limit: int | None = None,
):
    q = (
        db.query(ForecastModel)
        .filter(
            ForecastModel.store_id == store_id,
            ForecastModel.department_id == department_id,
        )
        .order_by(ForecastModel.week_date.asc())
        .offset(skip)
    )
    if limit is not None:
        q = q.limit(limit)
    return q.all()

