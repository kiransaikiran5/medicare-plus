from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import io

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.prescription import Prescription
from app.models.notification import Notification          # <-- added
from app.schemas.prescription import PrescriptionCreate, PrescriptionOut
from app.utils.pdf import generate_prescription_pdf

router = APIRouter()

# ---- GET /my (list own prescriptions) ----
@router.get("/my", response_model=List[PrescriptionOut])
def get_my_prescriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return db.query(Prescription).filter(Prescription.patient_id == patient.id).all()
    elif current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        return db.query(Prescription).filter(Prescription.doctor_id == doctor.id).all()
    else:  # ADMIN
        return db.query(Prescription).all()

# ---- GET /{id} (single prescription, role‑checked) ----
@router.get("/{prescription_id}", response_model=PrescriptionOut)
def get_prescription(
    prescription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    # Role‑based access control
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or prescription.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or prescription.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    # Admin can see any

    return prescription

# ---- POST / (create prescription, doctor only) ----
@router.post("/", response_model=PrescriptionOut, status_code=201)
def create_prescription(
    pres_in: PrescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can create prescriptions")
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    new_pres = Prescription(
        patient_id=pres_in.patient_id,
        doctor_id=doctor.id,
        medication=pres_in.medication,
        dosage=pres_in.dosage,
        instructions=pres_in.instructions or ""
    )
    db.add(new_pres)

    # ---- Notification for the patient ----
    db.add(Notification(
        user_id=new_pres.patient_id,               # the patient who receives the prescription
        message=f"New prescription created by doctor ID {doctor.id} for {new_pres.medication}.",
        type="PRESCRIPTION"
    ))

    db.commit()
    db.refresh(new_pres)
    return new_pres

# ---- GET /{id}/download (PDF download) ----
@router.get("/{prescription_id}/download")
def download_prescription(
    prescription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    # Same role check as above
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or prescription.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or prescription.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    pdf_bytes = generate_prescription_pdf(prescription)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=prescription_{prescription.id}.pdf"}
    )