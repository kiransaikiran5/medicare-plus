from datetime import datetime, date, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User
from app.models.doctor import Doctor
from app.models.doctor_schedule import DoctorSchedule
from app.models.appointment import Appointment, AppointmentStatus
from app.models.review import Review
from app.schemas.doctor import DoctorOut, DoctorUpdate
from app.utils.slot_utils import is_slot_available

router = APIRouter()

IST = timezone(timedelta(hours=5, minutes=30))


# -------------------------------------------------------------------
# HELPERS
# -------------------------------------------------------------------

def _normalize_day(day_value) -> str:
    """
    Supports:
    MONDAY
    Monday
    DayOfWeek.MONDAY
    """
    if hasattr(day_value, "value"):
        day_value = day_value.value

    return str(day_value).replace("DayOfWeek.", "").strip().upper()


def _ist_naive_to_utc_naive(dt: datetime) -> datetime:
    """
    Convert IST naive datetime to UTC naive datetime.

    Example:
    2026-06-11 09:00 IST -> 2026-06-11 03:30 UTC
    """
    return (
        dt.replace(tzinfo=IST)
        .astimezone(timezone.utc)
        .replace(tzinfo=None, second=0, microsecond=0)
    )


def _utc_naive_to_utc_iso(dt: datetime) -> str:
    """
    Return UTC ISO string for frontend.
    Frontend will display it as IST.

    Example:
    2026-06-11 03:30:00 -> 2026-06-11T03:30:00+00:00
    """
    return dt.replace(tzinfo=timezone.utc).isoformat()


def _build_doctor_out(db: Session, doctor: Doctor) -> DoctorOut:
    avg_rating = (
        db.query(func.avg(Review.rating))
        .filter(Review.doctor_id == doctor.id)
        .scalar()
    )

    avg_rating = round(float(avg_rating), 2) if avg_rating else None

    return DoctorOut(
        id=doctor.id,
        user_id=doctor.user_id,
        specialization=doctor.specialization,
        qualification=doctor.qualification,
        experience=doctor.experience,
        consultation_fee=doctor.consultation_fee,
        availability_status=doctor.availability_status,
        department_id=doctor.department_id,
        average_rating=avg_rating,
    )


# -------------------------------------------------------------------
# DOCTOR PROFILE
# -------------------------------------------------------------------

@router.get("/me", response_model=DoctorOut)
def get_my_doctor_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can access this")

    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    return _build_doctor_out(db, doctor)


@router.put("/me", response_model=DoctorOut)
def update_my_doctor_profile(
    update: DoctorUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can update their profile")

    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    update_data = update.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(doctor, field, value)

    db.commit()
    db.refresh(doctor)

    return _build_doctor_out(db, doctor)


# -------------------------------------------------------------------
# LIST DOCTORS
# -------------------------------------------------------------------

@router.get("/", response_model=List[DoctorOut])
def list_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = Query(None, description="Search in specialization or qualification"),
    specialization: Optional[str] = Query(None, description="Filter by exact specialization"),
    department_id: Optional[int] = Query(None, description="Filter by department"),
    available_only: Optional[bool] = Query(False, description="Show only available doctors"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum average rating"),
    max_rating: Optional[float] = Query(None, ge=0, le=5, description="Maximum average rating"),
    min_fee: Optional[float] = Query(None, ge=0, description="Minimum consultation fee"),
    max_fee: Optional[float] = Query(None, ge=0, description="Maximum consultation fee"),
):
    query = db.query(Doctor)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Doctor.specialization.ilike(search_term))
            | (Doctor.qualification.ilike(search_term))
        )

    if specialization:
        query = query.filter(Doctor.specialization == specialization)

    if department_id is not None:
        query = query.filter(Doctor.department_id == department_id)

    if available_only:
        query = query.filter(Doctor.availability_status == "AVAILABLE")

    if min_fee is not None:
        query = query.filter(Doctor.consultation_fee >= min_fee)

    if max_fee is not None:
        query = query.filter(Doctor.consultation_fee <= max_fee)

    doctors = query.all()
    result = []

    for doctor in doctors:
        doctor_out = _build_doctor_out(db, doctor)

        if min_rating is not None and (
            doctor_out.average_rating is None or doctor_out.average_rating < min_rating
        ):
            continue

        if max_rating is not None and (
            doctor_out.average_rating is not None and doctor_out.average_rating > max_rating
        ):
            continue

        result.append(doctor_out)

    return result


# -------------------------------------------------------------------
# AVAILABLE SLOTS
# -------------------------------------------------------------------

@router.get("/{doctor_id}/slots", response_model=List[str])
def get_available_slots(
    doctor_id: int,
    dt: str = Query(..., description="Date in YYYY-MM-DD or full ISO datetime"),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    try:
        query_date = date.fromisoformat(dt)
    except ValueError:
        try:
            query_date = datetime.fromisoformat(dt).date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    selected_day = query_date.strftime("%A").upper()

    schedules = (
        db.query(DoctorSchedule)
        .filter(DoctorSchedule.doctor_id == doctor_id)
        .all()
    )

    matching_schedules = [
        schedule
        for schedule in schedules
        if _normalize_day(schedule.day_of_week) == selected_day
    ]

    if not matching_schedules:
        return []

    available_slots = []

    for schedule in matching_schedules:
        start_dt_ist = datetime.combine(query_date, schedule.start_time).replace(
            second=0,
            microsecond=0,
        )

        end_dt_ist = datetime.combine(query_date, schedule.end_time).replace(
            second=0,
            microsecond=0,
        )

        slot_duration = timedelta(minutes=schedule.slot_duration_minutes or 30)

        current_slot_ist = start_dt_ist

        while current_slot_ist < end_dt_ist:
            # IMPORTANT FIX:
            # Convert IST schedule slot to UTC before checking appointment table.
            current_slot_utc = _ist_naive_to_utc_naive(current_slot_ist)

            if is_slot_available(doctor_id, current_slot_utc, db):
                available_slots.append(_utc_naive_to_utc_iso(current_slot_utc))

            current_slot_ist += slot_duration

    return available_slots


# -------------------------------------------------------------------
# ADMIN UPDATE DOCTOR
# -------------------------------------------------------------------

@router.put("/{doctor_id}", response_model=DoctorOut)
def update_doctor_admin(
    doctor_id: int,
    update: DoctorUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN")),
):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    update_data = update.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(doctor, field, value)

    db.commit()
    db.refresh(doctor)

    return _build_doctor_out(db, doctor)