from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.emergency_request import EmergencyPriority, EmergencyStatus

class EmergencyRequestBase(BaseModel):
    description: str
    priority: EmergencyPriority = EmergencyPriority.MEDIUM

class EmergencyRequestCreate(EmergencyRequestBase):
    pass   # patient_id will be derived from the logged-in patient

class EmergencyRequestUpdate(BaseModel):
    priority: Optional[EmergencyPriority] = None
    status: Optional[EmergencyStatus] = None

class EmergencyRequestOut(EmergencyRequestBase):
    id: int
    patient_id: int
    status: EmergencyStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True