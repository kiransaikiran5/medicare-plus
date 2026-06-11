from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.doctor import Doctor
from app.models.doctor_schedule import DoctorSchedule
from app.utils.slot_utils import is_slot_available

router = APIRouter()

@router.get("/{doctor_id}/slots")
def get_available_slots(
    doctor_id: int,
    dt: str = Query(..., description="Date in YYYY-MM-DD or full ISO datetime"),
    db: Session = Depends(get_db)
):
    # Verify doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Parse the dt parameter – it can be a date or a datetime
    try:
        # If it's a date only (e.g., "2026-06-15")
        query_date = date.fromisoformat(dt)
    except ValueError:
        try:
            # If it's a full datetime (e.g., "2026-06-15T11:00:00")
            query_date = datetime.fromisoformat(dt).date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    day_name = query_date.strftime("%A")
    schedules = db.query(DoctorSchedule).filter(
        DoctorSchedule.doctor_id == doctor_id,
        DoctorSchedule.day_of_week == day_name
    ).all()

    if not schedules:
        return []

    slots = []
    for sched in schedules:
        start_dt = datetime.combine(query_date, sched.start_time)
        end_dt = datetime.combine(query_date, sched.end_time)
        slot_delta = timedelta(minutes=sched.slot_duration_minutes)

        current = start_dt
        while current < end_dt:
            if is_slot_available(doctor_id, current, db):
                slots.append(current.isoformat())
            current += slot_delta

    return slots