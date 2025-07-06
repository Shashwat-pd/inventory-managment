
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
import models.store_department


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management & Forecasting API")

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

