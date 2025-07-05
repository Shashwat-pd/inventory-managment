from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.session import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key = True, index = True)
    name = Column(String, nullable = False)
    location = Column(String, nullable= True)
    size = Column(String, nullable=True)


    store_departments = relationship(
        "StoreDepartment",
        back_populates="store",
        cascade="all, delete-orphan",
        overlaps="departments",
    )
    departments = relationship(
        "Department",
        secondary="store_departments",
        back_populates="stores",
        overlaps= "store_departments",
    )
    inventories = relationship("Inventory", back_populates="store")
    forecasts = relationship("Forecast", back_populates="store")
    weekly_sales = relationship("WeeklySales", back_populates="store")
