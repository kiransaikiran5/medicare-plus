from pydantic import BaseModel, Field
from typing import Optional
from app.models.bed import BedStatus

# ---- Ward ----
class WardBase(BaseModel):
    name: str
    floor: Optional[str] = None
    description: Optional[str] = None

class WardCreate(WardBase):
    pass

class WardOut(WardBase):
    id: int
    class Config:
        from_attributes = True

# ---- Bed ----
class BedBase(BaseModel):
    ward_id: int
    bed_number: str

class BedCreate(BedBase):
    pass

class BedUpdate(BaseModel):
    bed_number: Optional[str] = None
    status: Optional[BedStatus] = None
    patient_id: Optional[int] = None   # to assign a patient

class BedOut(BaseModel):
    id: int
    ward_id: int
    bed_number: str
    status: BedStatus
    patient_id: Optional[int] = None

    class Config:
        from_attributes = True