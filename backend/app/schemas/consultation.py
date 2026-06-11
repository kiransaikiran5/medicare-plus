from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ConsultationBase(BaseModel):
    appointment_id: int
    doctor_notes: Optional[str] = ""

class ConsultationCreate(ConsultationBase):
    # Optional prescription fields to create together
    medication: Optional[str] = None
    dosage: Optional[str] = None
    instructions: Optional[str] = None

class ConsultationOut(ConsultationBase):
    id: int
    prescription_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True