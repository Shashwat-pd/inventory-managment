from fastapi import FastAPI
from app.api.endpoints import inventory
from app.db.session import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management API")

app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])

