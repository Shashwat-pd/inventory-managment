from pydantic import BaseModel
from datetime import date

class WeeklySalesBase(BaseModel):
    store_id: int
    department_id: int
    week_date: date
    weekly_sales: float | None = None
    is_holiday: bool = False

class WeeklySalesCreate(WeeklySalesBase):
    pass

class WeeklySalesOut(WeeklySalesBase):
    class Config:
        orm_mode = True

