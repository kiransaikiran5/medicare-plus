from pydantic import BaseModel, ConfigDict, field_serializer
from typing import Optional
from datetime import datetime, timezone, timedelta

from app.models.appointment import AppointmentStatus


IST = timezone(timedelta(hours=5, minutes=30))


def utc_naive_to_ist_iso(dt: datetime) -> str:
    """
    Database stores naive UTC datetime.
    Convert it to IST ISO string for frontend.

    Example:
    DB: 2026-06-11 03:30:00
    API response: 2026-06-11T09:00:00+05:30
    """
    if dt is None:
        return None

    if dt.tzinfo is None:
        utc_dt = dt.replace(tzinfo=timezone.utc)
    else:
        utc_dt = dt.astimezone(timezone.utc)

    ist_dt = utc_dt.astimezone(IST)
    return ist_dt.isoformat()


class AppointmentBase(BaseModel):
    doctor_id: int
    department_id: Optional[int] = None
    appointment_time: datetime
    reason: Optional[str] = ""


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    appointment_time: Optional[datetime] = None
    reason: Optional[str] = None


class AppointmentOut(AppointmentBase):
    id: int
    patient_id: int
    status: AppointmentStatus
    created_at: datetime

    @field_serializer("appointment_time")
    def serialize_appointment_time(self, dt: datetime) -> str:
        return utc_naive_to_ist_iso(dt)

    @field_serializer("created_at")
    def serialize_created_at(self, dt: datetime) -> str:
        return utc_naive_to_ist_iso(dt)

    model_config = ConfigDict(
        from_attributes=True,
        use_enum_values=True,
    )


class RescheduleRequest(BaseModel):
    new_time: datetime