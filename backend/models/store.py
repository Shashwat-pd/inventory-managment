from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.session import Base
from models.product import Product
from models.store_department import StoreDepartment
from models.department import Department
from models.weekly_sales import WeeklySales

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key = True, index = True)
    name = Column(String, nullable = False)
    location = Column(String, nullable= True)
    size = Column(String, nullable=True)
    products = relationship("Product", back_populates="store")


    store_departments = relationship(
        "StoreDepartment",
        back_populates="store",
        cascade="all, delete-orphan",
    )
    departments = relationship(
        "Department",
        secondary="store_department",
        back_populates="stores",
    )
    inventories = relationship("Inventory", back_populates="store")
    forecasts = relationship("Forecast", back_populates="store")
    weekly_sales = relationship("WeeklySales", back_populates="store")
