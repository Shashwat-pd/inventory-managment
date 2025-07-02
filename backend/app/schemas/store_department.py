from pydantic import BaseModel

class StoreDepartmentBase(BaseModel):
    store_id: int
    department_id: int

class StoreDepartmentCreate(StoreDepartmentBase):
    pass

class StoreDepartmentOut(StoreDepartmentBase):
    class Config:
        orm_mode = True

