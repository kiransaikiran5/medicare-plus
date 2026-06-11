from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User
from app.models.patient import Patient
from app.models.emergency_request import EmergencyRequest, EmergencyStatus
from app.schemas.emergency_request import (
    EmergencyRequestCreate, EmergencyRequestUpdate, EmergencyRequestOut
)
from app.models.notification import Notification

router = APIRouter()

# ----------------------------------------------------------------
#  PATIENT : submit a new emergency request
# ----------------------------------------------------------------
@router.post("/", response_model=EmergencyRequestOut, status_code=201)
def create_emergency_request(
    data: EmergencyRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Only patients can submit emergency requests")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Optional: limit number of open requests? Not required.

    new_req = EmergencyRequest(
        patient_id=patient.id,
        description=data.description,
        priority=data.priority,
        status=EmergencyStatus.PENDING
    )
    db.add(new_req)

    # Notify admins? We'll notify all admins (simplified: send to an admin user? We'll just create a notification for the first admin we find, or skip)
    # For simplicity, we'll create a notification for the patient themselves.
    db.add(Notification(
        user_id=current_user.id,
        message=f"Emergency request submitted with {data.priority} priority.",
        type="EMERGENCY"
    ))

    db.commit()
    db.refresh(new_req)
    return new_req

# ----------------------------------------------------------------
#  GET /my  – list requests for the logged-in user
# ----------------------------------------------------------------
@router.get("/my", response_model=List[EmergencyRequestOut])
def get_my_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return db.query(EmergencyRequest).filter(
            EmergencyRequest.patient_id == patient.id
        ).order_by(EmergencyRequest.created_at.desc()).all()
    elif current_user.role.value in ["DOCTOR", "ADMIN"]:
        # Doctors and admins can see all
        return db.query(EmergencyRequest).order_by(EmergencyRequest.created_at.desc()).all()
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

# ----------------------------------------------------------------
#  GET /{request_id} – single request details (role‑checked)
# ----------------------------------------------------------------
@router.get("/{request_id}", response_model=EmergencyRequestOut)
def get_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    # Patient can only see their own
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or req.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    return req

# ----------------------------------------------------------------
#  PUT /{request_id}/update – admin updates priority/status
# ----------------------------------------------------------------
@router.put("/{request_id}/update", response_model=EmergencyRequestOut)
def update_emergency_request(
    request_id: int,
    data: EmergencyRequestUpdate,
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    req = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if data.priority is not None:
        req.priority = data.priority
    if data.status is not None:
        req.status = data.status

    db.commit()
    db.refresh(req)

    # Notify the patient about the update (optional)
    patient_user = db.query(User).join(Patient).filter(Patient.id == req.patient_id).first()
    if patient_user:
        db.add(Notification(
            user_id=patient_user.id,
            message=f"Your emergency request #{req.id} status is now {req.status.value}.",
            type="EMERGENCY"
        ))
        db.commit()

    return req