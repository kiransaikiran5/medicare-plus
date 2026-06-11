from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.appointment import Appointment, AppointmentStatus
from app.models.telemedicine import TelemedicineSession, SessionStatus
from app.schemas.telemedicine import (
    TelemedicineSessionCreate, TelemedicineSessionOut, JoinSessionResponse
)

router = APIRouter()


@router.post("/", response_model=TelemedicineSessionOut, status_code=201)
def create_session(
    data: TelemedicineSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can create sessions")

    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    appointment = db.query(Appointment).filter(Appointment.id == data.appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.doctor_id != doctor.id:
        raise HTTPException(status_code=403, detail="This is not your appointment")

    if appointment.status not in [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED]:
        raise HTTPException(status_code=400, detail="Appointment must be confirmed or completed")

    existing = db.query(TelemedicineSession).filter(
        TelemedicineSession.appointment_id == appointment.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Session already exists for this appointment")

    # Use the meeting_link from the request (validated as URL)
    session = TelemedicineSession(
        appointment_id=appointment.id,
        meeting_link=str(data.meeting_link),
        created_by=doctor.id,
        status=SessionStatus.SCHEDULED
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/my", response_model=List[TelemedicineSessionOut])
def get_my_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        return db.query(TelemedicineSession).filter(
            TelemedicineSession.created_by == doctor.id
        ).all()
    elif current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return db.query(TelemedicineSession).join(Appointment).filter(
            Appointment.patient_id == patient.id
        ).all()
    elif current_user.role.value == "ADMIN":
        return db.query(TelemedicineSession).all()
    else:
        raise HTTPException(status_code=403, detail="Not authorized")


@router.get("/{session_id}/join", response_model=JoinSessionResponse)
def join_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(TelemedicineSession).filter(TelemedicineSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    appointment = session.appointment
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or appointment.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or session.created_by != doctor.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    # Admin is allowed to join any session (if needed, add admin check)

    if session.status == SessionStatus.SCHEDULED:
        session.status = SessionStatus.ACTIVE
        db.commit()

    return JoinSessionResponse(meeting_link=session.meeting_link)


@router.put("/{session_id}/end", response_model=TelemedicineSessionOut)
def end_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    recording_url: str = None
):
    if current_user.role.value not in ["DOCTOR", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Only doctors or admins can end sessions")

    session = db.query(TelemedicineSession).filter(TelemedicineSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or session.created_by != doctor.id:
            raise HTTPException(status_code=403, detail="Not your session")

    session.status = SessionStatus.ENDED
    if recording_url:
        session.recording_url = recording_url
    db.commit()
    db.refresh(session)
    return session