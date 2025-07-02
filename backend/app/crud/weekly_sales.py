from sqlalchemy.orm import Session
from datetime import date
from typing import List

from models.weekly_sales import WeeklySales as WeeklySalesModel
from app.schemas.weekly_sales import WeeklySalesCreate

def get_weekly_sales(
    db: Session,
    store_id: int,
    department_id: int,
    week_date: date
) -> WeeklySalesModel | None:
    return (
        db.query(WeeklySalesModel)
          .filter(
              WeeklySalesModel.store_id      == store_id,
              WeeklySalesModel.department_id == department_id,
              WeeklySalesModel.week_date     == week_date
          )
          .first()
    )

def get_all_weekly_sales(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[WeeklySalesModel]:
    return db.query(WeeklySalesModel).offset(skip).limit(limit).all()

def create_weekly_sales(
    db: Session,
    ws: WeeklySalesCreate
) -> WeeklySalesModel:
    obj = WeeklySalesModel(**ws.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def update_weekly_sales(
    db: Session,
    store_id: int,
    department_id: int,
    week_date: date,
    ws: WeeklySalesCreate
) -> WeeklySalesModel | None:
    obj = get_weekly_sales(db, store_id, department_id, week_date)
    if not obj:
        return None
    for field, value in ws.dict().items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj

def delete_weekly_sales(
    db: Session,
    store_id: int,
    department_id: int,
    week_date: date
) -> WeeklySalesModel | None:
    obj = get_weekly_sales(db, store_id, department_id, week_date)
    if not obj:
        return None
    db.delete(obj)
    db.commit()
    return obj

