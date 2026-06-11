from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LabTestBase(BaseModel):
    test_name: str
    notes: Optional[str] = ""

class LabTestCreate(LabTestBase):
    patient_id: Optional[int] = None      # Optional – backend fills for patients
    doctor_id: Optional[int] = None       # Optional – filled by backend if doctor

class LabTestUpdate(BaseModel):
    test_name: Optional[str] = None
    status: Optional[str] = None
    result_file_url: Optional[str] = None
    notes: Optional[str] = None

class LabTestOut(LabTestBase):
    id: int
    patient_id: int
    doctor_id: Optional[int] = None
    status: str
    result_file_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True