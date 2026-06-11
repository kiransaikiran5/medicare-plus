from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User
from app.models.patient import Patient
from app.models.bed import Bed, BedStatus
from app.models.admission import Admission, AdmissionStatus
from app.schemas.admission import AdmissionCreate, AdmissionOut, DischargeRequest

router = APIRouter()

@router.post("/", response_model=AdmissionOut, status_code=201)
def admit_patient(
    data: AdmissionCreate,
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Verify bed exists and is available
    bed = db.query(Bed).filter(Bed.id == data.bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    if bed.status != BedStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Bed is not available")
    if bed.patient_id is not None:
        raise HTTPException(status_code=400, detail="Bed already has a patient assigned")

    # Check if patient is already admitted
    existing_admission = db.query(Admission).filter(
        Admission.patient_id == data.patient_id,
        Admission.status == AdmissionStatus.ADMITTED
    ).first()
    if existing_admission:
        raise HTTPException(status_code=400, detail="Patient is already admitted in another bed")

    # Create admission
    admission = Admission(
        patient_id=data.patient_id,
        bed_id=data.bed_id,
        status=AdmissionStatus.ADMITTED,
        notes=data.notes or "",
        admission_date=datetime.utcnow()
    )
    db.add(admission)

    # Mark bed as OCCUPIED and assign patient
    bed.status = BedStatus.OCCUPIED
    bed.patient_id = data.patient_id

    db.commit()
    db.refresh(admission)
    return admission

@router.put("/{admission_id}/discharge", response_model=AdmissionOut)
def discharge_patient(
    admission_id: int,
    discharge: DischargeRequest = None,
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    admission = db.query(Admission).filter(Admission.id == admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    if admission.status != AdmissionStatus.ADMITTED:
        raise HTTPException(status_code=400, detail="Patient is not currently admitted")

    # Update admission
    admission.status = AdmissionStatus.DISCHARGED
    admission.discharge_date = datetime.utcnow()
    if discharge and discharge.notes:
        admission.notes = (admission.notes + "\nDischarge notes: " + discharge.notes).strip()

    # Free the bed
    bed = admission.bed
    if bed:
        bed.status = BedStatus.AVAILABLE
        bed.patient_id = None

    db.commit()
    db.refresh(admission)
    return admission

@router.get("/my", response_model=List[AdmissionOut])
def get_my_admissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return db.query(Admission).filter(Admission.patient_id == patient.id).order_by(Admission.admission_date.desc()).all()
    elif current_user.role.value == "DOCTOR":
        # Doctors see all admissions
        return db.query(Admission).all()
    else:  # ADMIN
        return db.query(Admission).all()

@router.get("/{admission_id}", response_model=AdmissionOut)
def get_admission(
    admission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    admission = db.query(Admission).filter(Admission.id == admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")

    # Patient can only see their own
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or admission.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    return admission