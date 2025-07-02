from pydantic import BaseModel

class DepartmentBase(BaseModel):
    name :str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentOut(DepartmentBase):
    id: int

    class Config:
        orm_mode = True
