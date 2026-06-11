from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime
from app.models.telemedicine import SessionStatus

class TelemedicineSessionCreate(BaseModel):
    appointment_id: int
    meeting_link: HttpUrl   # validates URL format

class TelemedicineSessionOut(BaseModel):
    id: int
    appointment_id: int
    meeting_link: str
    created_by: int
    status: SessionStatus
    recording_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class JoinSessionResponse(BaseModel):
    meeting_link: str