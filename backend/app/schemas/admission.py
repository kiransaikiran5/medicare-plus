from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AdmissionBase(BaseModel):
    patient_id: int
    bed_id: int
    notes: Optional[str] = ""

class AdmissionCreate(AdmissionBase):
    pass

class AdmissionOut(AdmissionBase):
    id: int
    admission_date: datetime
    discharge_date: Optional[datetime] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class DischargeRequest(BaseModel):
    notes: Optional[str] = None