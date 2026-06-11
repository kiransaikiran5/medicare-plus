from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment, AppointmentStatus
from app.models.notification import Notification
from app.schemas.appointment import AppointmentCreate, AppointmentOut, RescheduleRequest
from app.utils.slot_utils import is_slot_available

router = APIRouter()

IST = timezone(timedelta(hours=5, minutes=30))


# -------------------------------------------------------------------
# HELPERS
# -------------------------------------------------------------------

def _get_role(current_user: User) -> str:
    role = getattr(current_user, "role", "")

    if hasattr(role, "value"):
        return role.value

    return str(role)


def _incoming_ist_to_utc_naive(dt: datetime) -> datetime:
    """
    Frontend selected time is treated as IST.
    Example:
    2026-06-11 09:00 IST -> 2026-06-11 03:30 UTC

    DB stores UTC as naive datetime.
    """
    if dt.tzinfo is None:
        return dt.replace(tzinfo=IST).astimezone(timezone.utc).replace(tzinfo=None)

    return dt.astimezone(timezone.utc).replace(tzinfo=None)


def _now_utc_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _notify(db: Session, user_id: int, message: str, notification_type: str = "APPOINTMENT"):
    if user_id:
        db.add(
            Notification(
                user_id=user_id,
                message=message,
                type=notification_type,
            )
        )


# -------------------------------------------------------------------
# CREATE APPOINTMENT
# -------------------------------------------------------------------

@router.post("/", response_model=AppointmentOut, status_code=201)
def book_appointment(
    appt: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role = _get_role(current_user)

    if role != "PATIENT":
        raise HTTPException(status_code=403, detail="Only patients can book appointments")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    doctor = db.query(Doctor).filter(Doctor.id == appt.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # IMPORTANT FIX:
    # Selected frontend time is IST. Convert IST -> UTC before saving.
    appointment_time_utc = _incoming_ist_to_utc_naive(appt.appointment_time)

    if appointment_time_utc <= _now_utc_naive():
        raise HTTPException(status_code=400, detail="Appointment time must be in the future")

    if not is_slot_available(appt.doctor_id, appointment_time_utc, db):
        raise HTTPException(status_code=400, detail="Selected time slot is not available")

    new_appt = Appointment(
        patient_id=patient.id,
        doctor_id=appt.doctor_id,
        department_id=appt.department_id,
        appointment_time=appointment_time_utc,
        reason=appt.reason,
        status=AppointmentStatus.PENDING,
    )

    db.add(new_appt)

    _notify(
        db,
        doctor.user_id,
        f"New appointment request from {patient.full_name or 'a patient'}",
    )

    _notify(
        db,
        current_user.id,
        "Your appointment request has been submitted",
    )

    db.commit()
    db.refresh(new_appt)

    return new_appt


# -------------------------------------------------------------------
# GET MY APPOINTMENTS
# -------------------------------------------------------------------

@router.get("/my", response_model=List[AppointmentOut])
def get_my_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role = _get_role(current_user)

    if role == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()

        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")

        appointments = (
            db.query(Appointment)
            .filter(Appointment.patient_id == patient.id)
            .order_by(Appointment.appointment_time.desc())
            .all()
        )

    elif role == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()

        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")

        appointments = (
            db.query(Appointment)
            .filter(Appointment.doctor_id == doctor.id)
            .order_by(Appointment.appointment_time.desc())
            .all()
        )

    elif role == "ADMIN":
        appointments = (
            db.query(Appointment)
            .order_by(Appointment.appointment_time.desc())
            .all()
        )

    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    return appointments


# -------------------------------------------------------------------
# CANCEL APPOINTMENT
# -------------------------------------------------------------------

@router.put("/{appt_id}/cancel", response_model=AppointmentOut)
def cancel_appointment(
    appt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role = _get_role(current_user)

    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if role not in ["PATIENT", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    if role == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()

        if not patient or appt.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Not your appointment")

    if appt.status in [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED]:
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel a completed or already cancelled appointment",
        )

    appt.status = AppointmentStatus.CANCELLED

    patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
    doctor = db.query(Doctor).filter(Doctor.id == appt.doctor_id).first()

    if patient:
        _notify(
            db,
            patient.user_id,
            f"Your appointment with doctor ID {appt.doctor_id} has been cancelled.",
        )

    if doctor:
        _notify(
            db,
            doctor.user_id,
            f"Appointment with patient ID {appt.patient_id} was cancelled.",
        )

    db.commit()
    db.refresh(appt)

    return appt


# -------------------------------------------------------------------
# RESCHEDULE APPOINTMENT
# -------------------------------------------------------------------

@router.put("/{appt_id}/reschedule", response_model=AppointmentOut)
def reschedule_appointment(
    appt_id: int,
    request: RescheduleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role = _get_role(current_user)

    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if role not in ["PATIENT", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    if role == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()

        if not patient or appt.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Not your appointment")

    if appt.status in [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED]:
        raise HTTPException(
            status_code=400,
            detail="Cannot reschedule a completed or cancelled appointment",
        )

    # IMPORTANT FIX:
    # Selected reschedule slot is also treated as IST.
    # 09:00 IST -> 03:30 UTC saved in DB.
    new_time_utc = _incoming_ist_to_utc_naive(request.new_time)

    if new_time_utc <= _now_utc_naive():
        raise HTTPException(status_code=400, detail="New appointment time must be in the future")

    if not is_slot_available(appt.doctor_id, new_time_utc, db):
        raise HTTPException(status_code=400, detail="Selected time slot is not available")

    appt.appointment_time = new_time_utc
    appt.status = AppointmentStatus.PENDING

    patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
    doctor = db.query(Doctor).filter(Doctor.id == appt.doctor_id).first()

    if patient:
        _notify(
            db,
            patient.user_id,
            f"Your appointment has been rescheduled to {request.new_time.strftime('%d %b %Y, %I:%M %p')}.",
        )

    if doctor:
        _notify(
            db,
            doctor.user_id,
            f"Appointment with patient ID {appt.patient_id} has been rescheduled.",
        )

    db.commit()
    db.refresh(appt)

    return appt