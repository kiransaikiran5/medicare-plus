from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.patient import Patient
from app.models.medicine_reminder import MedicineReminder, ReminderStatus
from app.models.notification import Notification
from app.schemas.medicine_reminder import (
    MedicineReminderCreate,
    MedicineReminderOut,
)

router = APIRouter()

IST = timezone(timedelta(hours=5, minutes=30))


# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

def _get_role(current_user: User) -> str:
    role = getattr(current_user, "role", "")

    if hasattr(role, "value"):
        return str(role.value).upper()

    return str(role).upper()


def _client_time_to_utc_naive(dt: datetime) -> datetime:
    """
    Project rule:
    - Frontend user selects local IST time.
    - MySQL stores UTC naive datetime.

    Handles both:
    1. Frontend sends naive datetime:
       2026-06-11T10:00
       treated as IST and saved as 2026-06-11 04:30 UTC

    2. Frontend sends timezone-aware datetime:
       2026-06-11T10:00:00+05:30
       converted and saved as 2026-06-11 04:30 UTC
    """
    if dt.tzinfo is None:
        return (
            dt.replace(tzinfo=IST)
            .astimezone(timezone.utc)
            .replace(tzinfo=None, second=0, microsecond=0)
        )

    return (
        dt.astimezone(timezone.utc)
        .replace(tzinfo=None, second=0, microsecond=0)
    )


def _now_utc_naive() -> datetime:
    return datetime.now(timezone.utc).replace(
        tzinfo=None,
        second=0,
        microsecond=0,
    )


def _ist_date_range_to_utc_naive(date_text: str):
    """
    date_filter comes from frontend as IST date:
    2026-06-11

    DB stores UTC, so convert IST day start/end to UTC range.
    """
    try:
        date_obj = datetime.strptime(date_text, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format. Use YYYY-MM-DD",
        )

    start_ist = datetime.combine(date_obj, datetime.min.time()).replace(tzinfo=IST)
    end_ist = datetime.combine(date_obj, datetime.max.time()).replace(tzinfo=IST)

    start_utc = start_ist.astimezone(timezone.utc).replace(tzinfo=None)
    end_utc = end_ist.astimezone(timezone.utc).replace(tzinfo=None)

    return start_utc, end_utc


def _create_notification(
    db: Session,
    user_id: int,
    message: str,
):
    db.add(
        Notification(
            user_id=user_id,
            message=message,
            type="REMINDER",
        )
    )


def _get_patient_for_user(
    current_user: User,
    db: Session,
) -> Patient:
    patient = (
        db.query(Patient)
        .filter(Patient.user_id == current_user.id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient profile not found",
        )

    return patient


# ---------------------------------------------------------
# CREATE REMINDER
# ---------------------------------------------------------

@router.post("/", response_model=MedicineReminderOut, status_code=201)
def create_reminder(
    data: MedicineReminderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if _get_role(current_user) != "PATIENT":
        raise HTTPException(
            status_code=403,
            detail="Only patients can create reminders",
        )

    patient = _get_patient_for_user(current_user, db)

    scheduled_time_utc = _client_time_to_utc_naive(data.scheduled_time)

    if scheduled_time_utc <= _now_utc_naive():
        raise HTTPException(
            status_code=400,
            detail="Scheduled time must be in the future",
        )

    reminder = MedicineReminder(
        patient_id=patient.id,
        medicine_name=data.medicine_name,
        dosage=data.dosage,
        scheduled_time=scheduled_time_utc,
        status=ReminderStatus.PENDING,
    )

    db.add(reminder)

    _create_notification(
        db=db,
        user_id=current_user.id,
        message=f"Reminder set: {data.medicine_name} ({data.dosage})",
    )

    db.commit()
    db.refresh(reminder)

    return reminder


# ---------------------------------------------------------
# GET MY REMINDERS
# ---------------------------------------------------------

@router.get("/my", response_model=List[MedicineReminderOut])
def get_my_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    status_filter: Optional[str] = Query(None),
    date_filter: Optional[str] = Query(None),
):
    if _get_role(current_user) != "PATIENT":
        raise HTTPException(
            status_code=403,
            detail="Only patients can view reminders",
        )

    patient = _get_patient_for_user(current_user, db)

    query = db.query(MedicineReminder).filter(
        MedicineReminder.patient_id == patient.id
    )

    if status_filter:
        query = query.filter(MedicineReminder.status == status_filter)

    if date_filter:
        start_utc, end_utc = _ist_date_range_to_utc_naive(date_filter)

        query = query.filter(
            MedicineReminder.scheduled_time >= start_utc,
            MedicineReminder.scheduled_time <= end_utc,
        )

    return query.order_by(MedicineReminder.scheduled_time.desc()).all()


# ---------------------------------------------------------
# MARK AS TAKEN
# ---------------------------------------------------------

@router.put("/{reminder_id}/mark-taken", response_model=MedicineReminderOut)
def mark_as_taken(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if _get_role(current_user) != "PATIENT":
        raise HTTPException(
            status_code=403,
            detail="Only patients can mark reminders as taken",
        )

    patient = _get_patient_for_user(current_user, db)

    reminder = (
        db.query(MedicineReminder)
        .filter(
            MedicineReminder.id == reminder_id,
            MedicineReminder.patient_id == patient.id,
        )
        .first()
    )

    if not reminder:
        raise HTTPException(
            status_code=404,
            detail="Reminder not found",
        )

    if reminder.status != ReminderStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Only pending reminders can be marked as taken",
        )

    reminder.status = ReminderStatus.TAKEN

    _create_notification(
        db=db,
        user_id=current_user.id,
        message=f"You've taken {reminder.medicine_name} ({reminder.dosage})",
    )

    db.commit()
    db.refresh(reminder)

    return reminder


# ---------------------------------------------------------
# DELETE REMINDER
# ---------------------------------------------------------

@router.delete("/{reminder_id}", status_code=204)
def delete_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if _get_role(current_user) != "PATIENT":
        raise HTTPException(
            status_code=403,
            detail="Only patients can delete reminders",
        )

    patient = _get_patient_for_user(current_user, db)

    reminder = (
        db.query(MedicineReminder)
        .filter(
            MedicineReminder.id == reminder_id,
            MedicineReminder.patient_id == patient.id,
        )
        .first()
    )

    if not reminder:
        raise HTTPException(
            status_code=404,
            detail="Reminder not found",
        )

    db.delete(reminder)
    db.commit()

    return None