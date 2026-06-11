from pydantic import BaseModel, Field
from typing import Optional
from datetime import time
from app.models.doctor_schedule import DayOfWeek

class DoctorScheduleBase(BaseModel):
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    slot_duration_minutes: int = Field(default=30, ge=10, le=120)
    max_patients_per_slot: int = Field(default=1, ge=1)

class DoctorScheduleCreate(DoctorScheduleBase):
    pass

class DoctorScheduleUpdate(BaseModel):
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    slot_duration_minutes: Optional[int] = None
    max_patients_per_slot: Optional[int] = None

class DoctorScheduleOut(DoctorScheduleBase):
    id: int
    doctor_id: int

    class Config:
        from_attributes = True