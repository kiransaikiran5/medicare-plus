from pydantic import BaseModel, Field
from typing import Optional

class DoctorBase(BaseModel):
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience: Optional[int] = None
    consultation_fee: Optional[float] = None
    availability_status: Optional[str] = None
    department_id: Optional[int] = None

class DoctorUpdate(DoctorBase):
    pass

class DoctorOut(DoctorBase):
    id: int
    user_id: int
    average_rating: Optional[float] = None 

    class Config:
        from_attributes = True