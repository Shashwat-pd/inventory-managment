from pydantic import BaseModel

class ProductBase(BaseModel):
    name: str
    price: float
    department_id: int
    description: str | None = None

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: str

    class Config:
        orm_mode = True

