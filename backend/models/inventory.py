from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, func, text
from sqlalchemy.orm import relationship
from db.session import Base

class Inventory(Base):
    __tablename__ = "inventories"
    __table_args__ = {'extend_existing': True}

    store_id = Column(
        Integer,
        ForeignKey("stores.id", ondelete="CASCADE"),
        primary_key=True,
        index=True
    )
    department_id = Column(
        Integer,
        ForeignKey("departments.id", ondelete="CASCADE"),
        primary_key=True,
        index=True
    )
    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True,
        index=True
    )
    stock_level = Column(
        Integer,
        nullable=False,
        default=0
    )
    last_updated = Column(
        TIMESTAMP,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=func.current_timestamp()
    )

    store = relationship(
        "Store",
        back_populates="inventories"
    )
    product = relationship(
        "Product",
        back_populates="inventories"
    )
    department = relationship(
        "Department",
        back_populates="inventories"
    )
