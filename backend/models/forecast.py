from sqlalchemy import Column, Integer, String, Float, Date
from db.session import Base

class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    store = Column(Integer, index=True)
    dept = Column(Integer, index=T=True)
    predicted_sales = Column(Float)