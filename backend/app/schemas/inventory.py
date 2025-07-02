from pydantic import BaseModel
from datetime import datetime

class InventoryBase(BaseModel):
    store_id: int
    inventory_id: int
    product_id: int
    stock_level: int = 0

class InventoryCreate(InventoryBase):
    pass

class InventoryOut(InventoryBase):
    last_updated: datetime

    class Config:
        orm_mode = True

