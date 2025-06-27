from pydantic import BaseModel

class StoreBase(BaseModel):
    name :str
    location: str | None = None

class StoreCreate(StoreBase):
    pass

class StoreOut(StoreBase):
    id: int

    class Config:
        orm_mode = True 
