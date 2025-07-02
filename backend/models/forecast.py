from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from db.session import Base

class Forecast(Base):
    __tablename__ = "forecasts"

    store_id = Column(
        Integer,
        ForeignKey("stores.id", ondelete="CASCADE"),
        primary_key=True
    )
    department_id = Column(
        Integer,
        ForeignKey("departments.id", ondelete="CASCADE"),
        primary_key=True
    )
    week_date = Column(
        Date,
        primary_key=True,
        index=True
    )
    predicted_sales = Column(
        Numeric(12, 2),
        nullable=False
    )
    lower_ci = Column(
        Numeric(12, 2),
        nullable=True
    )
    upper_ci = Column(
        Numeric(12, 2),
        nullable=True
    )
    model_version = Column(
        String(50),
        nullable=True
    )

    store = relationship("Store", back_populates="forecasts")
    department = relationship("Department", back_populates="forecasts")

