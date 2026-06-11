from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.patient import Patient
from app.models.emergency_contact import EmergencyContact
from app.schemas.emergency_contact import (
    EmergencyContactCreate, EmergencyContactOut, HospitalEmergencyInfo
)

router = APIRouter()

# ---- Hospital emergency info (public) ----
@router.get("/hospital-info", response_model=HospitalEmergencyInfo)
def get_hospital_emergency_info():
    return HospitalEmergencyInfo()

# ---- Patient's emergency contacts ----
@router.get("/contacts/my", response_model=List[EmergencyContactOut])
def get_my_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Only patients can access emergency contacts")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    return db.query(EmergencyContact).filter(EmergencyContact.patient_id == patient.id).all()

@router.post("/contacts", response_model=EmergencyContactOut, status_code=201)
def add_contact(
    contact_in: EmergencyContactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Only patients can add contacts")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    new_contact = EmergencyContact(
        patient_id=patient.id,
        name=contact_in.name,
        relationship=contact_in.relationship,
        phone=contact_in.phone
    )
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact

@router.put("/contacts/{contact_id}", response_model=EmergencyContactOut)
def update_contact(
    contact_id: int,
    contact_in: EmergencyContactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Only patients can update contacts")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id,
        EmergencyContact.patient_id == patient.id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    contact.name = contact_in.name
    contact.relationship = contact_in.relationship
    contact.phone = contact_in.phone
    db.commit()
    db.refresh(contact)
    return contact

@router.delete("/contacts/{contact_id}", status_code=204)
def delete_contact(
    contact_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Only patients can delete contacts")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id,
        EmergencyContact.patient_id == patient.id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()
    return None