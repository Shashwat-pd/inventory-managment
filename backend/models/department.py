from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.session import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index = True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)

    products = relationship("Product", back_populates="department")


