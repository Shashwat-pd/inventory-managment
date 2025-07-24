from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.session import Base
class Department(Base):
    __tablename__ = "departments"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)

    products = relationship("Product", back_populates="department")

    store_departments = relationship(
        "StoreDepartment",
        back_populates="department",
        cascade="all, delete-orphan",
        overlaps="stores",
    )
    stores = relationship(
        "Store",
        secondary="store_departments",
        back_populates="departments",
        overlaps= "store_departments",
    )
    inventories = relationship("Inventory", back_populates="department")
    forecasts = relationship("Forecast", back_populates="department")
    weekly_sales = relationship("WeeklySales", back_populates="department")

