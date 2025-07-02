from sqlalchemy import Column, Integer, String, Float, ForeignKey
from db.session import Base
from sqlalchemy.orm import relationship

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=0)

    store_id = Column(Integer,ForeignKey("stores.id"))
    department_id = Column(Integer,ForeignKey("departments.id"))

    store = relationship ("Store", back_populates = "products")
    department = relationship("Department", back_populates= "products")
    inventories = relationship("Inventory", back_populates="product")
