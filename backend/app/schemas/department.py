from pydantic import BaseModel
from typing import Optional

class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = ""

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class DepartmentOut(DepartmentBase):
    id: int

    class Config:
        from_attributes = True

# For statistics
class DepartmentStats(BaseModel):
    id: int
    name: str
    doctor_count: int
    # appointment_count can be added later

    class Config:
        from_attributes = True