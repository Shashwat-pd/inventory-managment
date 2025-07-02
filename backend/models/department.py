from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.session import Base
from models.store_department import StoreDepartment
from models.store import Store
from models.weekly_sales import WeeklySales

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index = True)
    name = Column(String, nullable=False)

    products = relationship("Product", back_populates="department")

    store_departments = relationship(
        "StoreDepartment",
        back_populates="department",
        cascade="all, delete-orphan",
    )
    stores = relationship(
        "Store",
        secondary="store_department",
        back_populates="departments",
    )
    inventories = relationship("Inventory", back_populates="department")
    forecasts = relationship("Forecast", back_populates="department")
