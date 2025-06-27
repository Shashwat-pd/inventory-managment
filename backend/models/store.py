from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.session import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key = True, index = True)
    name = Column(String, nullable = False)
    location = Column(String, nullable= True)

    products = relationship("Product", back_populates="store")

    

