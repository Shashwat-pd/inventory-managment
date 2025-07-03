from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from db.session import Base


class StoreDepartment(Base):
    __tablename__ = "store_department"

    store_id = Column(
        Integer,
        ForeignKey("stores.id", ondelete="CASCADE"),
        primary_key=True,
    )
    department_id = Column(
        Integer,
        ForeignKey("departments.id", ondelete="CASCADE"),
        primary_key=True,
    )
    store = relationship(
        "Store",
        back_populates="store_departments",
        overlaps="departments,stores",
    )
    department = relationship(
        "Department",
        back_populates="store_departments",
        overlaps="departments,stores",
    )
