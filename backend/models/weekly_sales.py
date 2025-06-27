from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from db.session import Base

class WeeklySales(Base):
    __tablename__ = "weekly_sales"

    id = Column(Integer, primary_key=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    date = Column(Date, nullable=False)
    weekly_sales = Column(Float, nullable=False)

