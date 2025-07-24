from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from db.session import Base

class Forecast(Base):
    __tablename__ = "forecasts"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    week_date = Column(Date, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True)
    predicted_sales = Column(Float)

    store = relationship("Store", back_populates="forecasts")
    department = relationship("Department", back_populates="forecasts")
