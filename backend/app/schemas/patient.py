from pydantic import BaseModel, field_serializer
from datetime import datetime, timezone, timedelta
from typing import Optional

class PatientBase(BaseModel):
    full_name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class PatientUpdate(PatientBase):
    pass

class PatientOut(PatientBase):
    id: int
    user_id: int
    created_at: datetime

    @field_serializer('created_at')
    def format_created_at(self, dt: datetime) -> str:
        # The database returns an IST‑aware datetime (because session timezone is +05:30)
        # We just make sure it has the +05:30 offset and return ISO format
        ist = timezone(timedelta(hours=5, minutes=30))
        dt_ist = dt.astimezone(ist)   # harmless even if already IST
        return dt_ist.isoformat()

    model_config = {"from_attributes": True}