from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, ConfigDict, field_serializer

from app.models.medicine_reminder import ReminderStatus


IST = timezone(timedelta(hours=5, minutes=30))


def utc_naive_to_ist_iso(dt: datetime) -> str:
    """
    Database stores datetime as naive UTC.

    Example:
    DB UTC: 2026-06-11 04:30:00
    API IST: 2026-06-11T10:00:00+05:30
    """
    if dt is None:
        return None

    if dt.tzinfo is None:
        utc_dt = dt.replace(tzinfo=timezone.utc)
    else:
        utc_dt = dt.astimezone(timezone.utc)

    ist_dt = utc_dt.astimezone(IST)

    return ist_dt.isoformat()


class MedicineReminderBase(BaseModel):
    medicine_name: str
    dosage: str
    scheduled_time: datetime


class MedicineReminderCreate(MedicineReminderBase):
    pass


class MedicineReminderOut(BaseModel):
    id: int
    patient_id: int
    medicine_name: str
    dosage: str
    scheduled_time: datetime
    status: ReminderStatus
    created_at: datetime

    @field_serializer("scheduled_time")
    def serialize_scheduled_time(self, dt: datetime) -> str:
        return utc_naive_to_ist_iso(dt)

    @field_serializer("created_at")
    def serialize_created_at(self, dt: datetime) -> str:
        return utc_naive_to_ist_iso(dt)

    model_config = ConfigDict(
        from_attributes=True,
        use_enum_values=True,
    )