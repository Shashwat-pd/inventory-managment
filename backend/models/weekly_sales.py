from sqlalchemy import Column, Integer, Float, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from db.session import Base
from models.store import Store
from models.department import Department

class WeeklySales(Base):
    __tablename__ = "weekly_sales"

    id = Column(Integer, primary_key=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    week_date = Column(Date, nullable=False)
    weekly_sales = Column(Float, nullable=False)
    is_holiday = Column(Boolean, nullable=False)

    store = relationship("Store", back_populates="weekly_sales")
    department = relationship("Department", back_populates="weekly_sales")
