from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.session import Base
class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index = True)
    name = Column(String, nullable=False)

    products = relationship("Product", back_populates="department")

    store_departments = relationship(
        "StoreDepartment",
        back_populates="department",
        cascade="all, delete-orphan",
        overlaps="departments",
    )
    stores = relationship(
        "Store",
        secondary="store_department",
        back_populates="departments",
        overlaps= "store_departments",
    )
    inventories = relationship("Inventory", back_populates="department")
    forecasts = relationship("Forecast", back_populates="department")
    weekly_sales = relationship("WeeklySales", back_populates="department")

