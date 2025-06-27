from fastapi import FastAPI
from app.api.endpoints import inventory, stores, departments
from db.session import Base, engine

from models import store, department, product, weekly_sales

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management API")

app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(stores.router, prefix="/api/stores", tags=["Stores"])
app.include_router(departments.router, prefix="/api/departments", tags=["Departments"])

