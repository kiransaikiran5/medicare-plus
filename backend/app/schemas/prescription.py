from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PrescriptionBase(BaseModel):
    patient_id: int
    medication: str
    dosage: str
    instructions: Optional[str] = ""

class PrescriptionCreate(PrescriptionBase):
    # doctor_id is NOT in the request – it is set server‑side
    pass

class PrescriptionOut(PrescriptionBase):
    id: int
    doctor_id: int
    created_at: datetime

    class Config:
        from_attributes = True