from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.appointment import Appointment, AppointmentStatus
from app.models.consultation import Consultation
from app.models.prescription import Prescription
from app.schemas.consultation import ConsultationCreate, ConsultationOut

router = APIRouter()


@router.post("/", response_model=ConsultationOut, status_code=201)
def create_consultation(
    data: ConsultationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only doctors can create consultations
    if current_user.role.value != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can create consultations")

    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    # Verify the appointment exists and belongs to this doctor
    appointment = db.query(Appointment).filter(Appointment.id == data.appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.doctor_id != doctor.id:
        raise HTTPException(status_code=403, detail="This is not your appointment")
    if appointment.status in [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED]:
        raise HTTPException(status_code=400, detail="Appointment is already completed or cancelled")

    # Create consultation
    consultation = Consultation(
        appointment_id=data.appointment_id,
        doctor_notes=data.doctor_notes or ""
    )
    db.add(consultation)
    db.flush()  # get consultation.id

    # If prescription details are provided, create a prescription
    if data.medication and data.dosage:
        prescription = Prescription(
            patient_id=appointment.patient_id,
            doctor_id=doctor.id,
            medication=data.medication,
            dosage=data.dosage,
            instructions=data.instructions or ""
        )
        db.add(prescription)
        db.flush()  # get prescription.id
        consultation.prescription_id = prescription.id

    # Mark appointment as completed
    appointment.status = AppointmentStatus.COMPLETED
    db.commit()
    db.refresh(consultation)
    return consultation


@router.get("/my", response_model=List[ConsultationOut])
def get_my_consultations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return (
            db.query(Consultation)
            .join(Appointment)
            .filter(Appointment.patient_id == patient.id)
            .order_by(Consultation.created_at.desc())
            .all()
        )
    elif current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        return (
            db.query(Consultation)
            .join(Appointment)
            .filter(Appointment.doctor_id == doctor.id)
            .order_by(Consultation.created_at.desc())
            .all()
        )
    else:
        # Admin sees all
        return db.query(Consultation).all()