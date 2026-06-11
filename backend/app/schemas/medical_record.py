from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class MedicalRecordBase(BaseModel):
    patient_id: int
    record_type: str
    description: str
    file_url: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecordUpdate(BaseModel):
    record_type: Optional[str] = None
    description: Optional[str] = None
    file_url: Optional[str] = None

class MedicalRecordOut(MedicalRecordBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True