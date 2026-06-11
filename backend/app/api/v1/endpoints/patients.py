from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User
from app.models.patient import Patient
from app.schemas.patient import PatientOut, PatientUpdate

router = APIRouter()

@router.get("/me", response_model=PatientOut)
def get_my_patient_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the patient profile of the currently logged-in patient.
    """
    if current_user.role.value != "PATIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can access this endpoint"
        )
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return patient

@router.put("/me", response_model=PatientOut)
def update_my_patient_profile(
    update: PatientUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the patient profile of the currently logged-in patient.
    """
    if current_user.role.value != "PATIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can update their profile"
        )
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Update only the fields that are provided (not None)
    update_data = update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    return patient

@router.get("/", response_model=List[PatientOut])
def list_all_patients(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint to list all patients.
    """
    return db.query(Patient).all()