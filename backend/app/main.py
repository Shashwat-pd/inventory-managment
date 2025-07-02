
from fastapi import FastAPI
from app.api.endpoints import (
    inventory,
    stores,
    departments,
    product,
    weekly_sales,
    forecast,
)
from db.session import Base, engine

import models.store
import models.department
import models.product
import models.weekly_sales
import models.inventory
import models.forecast

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management & Forecasting API")

app.include_router(
    stores.router,
    prefix="/api/stores",
    tags=["Stores"],
)
app.include_router(
    departments.router,
    prefix="/api/departments",
    tags=["Departments"],
)
app.include_router(
    product.router,
    prefix="/api/products",
    tags=["Products"],
)
app.include_router(
    inventory.router,
    prefix="/api/inventory",
    tags=["Inventory"],
)
app.include_router(
    weekly_sales.router,
    prefix="/api/weekly_sales",
    tags=["Weekly Sales"],
)
app.include_router(
    forecast.router,
    prefix="/api/forecasts",
    tags=["Forecasts"],
)

