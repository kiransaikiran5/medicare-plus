from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.doctor import Doctor
from app.models.doctor_schedule import DoctorSchedule
from app.schemas.doctor_schedule import (
    DoctorScheduleCreate, DoctorScheduleUpdate, DoctorScheduleOut
)

router = APIRouter()

# ---- Get own schedules (doctor) ----
@router.get("/my", response_model=List[DoctorScheduleOut])
def get_my_schedules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can access schedules")

    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    return db.query(DoctorSchedule).filter(DoctorSchedule.doctor_id == doctor.id).all()

# ---- Create a schedule ----
@router.post("/", response_model=DoctorScheduleOut, status_code=201)
def create_schedule(
    schedule_in: DoctorScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can create schedules")

    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    # Check for duplicate day
    existing = db.query(DoctorSchedule).filter(
        DoctorSchedule.doctor_id == doctor.id,
        DoctorSchedule.day_of_week == schedule_in.day_of_week
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Schedule for this day already exists. Update instead.")

    new_sched = DoctorSchedule(
        doctor_id=doctor.id,
        day_of_week=schedule_in.day_of_week,
        start_time=schedule_in.start_time,
        end_time=schedule_in.end_time,
        slot_duration_minutes=schedule_in.slot_duration_minutes,
        max_patients_per_slot=schedule_in.max_patients_per_slot
    )
    db.add(new_sched)
    db.commit()
    db.refresh(new_sched)
    return new_sched

# ---- Update a schedule ----
@router.put("/{schedule_id}", response_model=DoctorScheduleOut)
def update_schedule(
    schedule_id: int,
    update: DoctorScheduleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can update schedules")

    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    sched = db.query(DoctorSchedule).filter(
        DoctorSchedule.id == schedule_id,
        DoctorSchedule.doctor_id == doctor.id
    ).first()
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")

    update_data = update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sched, field, value)
    db.commit()
    db.refresh(sched)
    return sched

# ---- Delete a schedule ----
@router.delete("/{schedule_id}", status_code=204)
def delete_schedule(
    schedule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can delete schedules")

    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    sched = db.query(DoctorSchedule).filter(
        DoctorSchedule.id == schedule_id,
        DoctorSchedule.doctor_id == doctor.id
    ).first()
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")

    db.delete(sched)
    db.commit()
    return None

# ---- (Optional) Public view of a doctor's schedule ----
@router.get("/doctor/{doctor_id}", response_model=List[DoctorScheduleOut])
def get_doctor_schedule(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    # Public endpoint, no auth required (or any authenticated user)
    return db.query(DoctorSchedule).filter(DoctorSchedule.doctor_id == doctor_id).all()