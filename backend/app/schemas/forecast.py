from pydantic import BaseModel
from datetime import date

class Forecast(BaseModel):
    store_id: int
    department_id: int
    week_date: date
    predicted_sales: float
    upper_ci: float | None = None
    lower_ci: float | None = None



class ForecastCreate(ForecastBase):
    pass

class ForecastOut(ForecastBase):
    class Config:
        orm_mode = True

