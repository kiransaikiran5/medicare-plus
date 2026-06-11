from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone   # <-- added timezone

from app.core.database import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User
from app.models.patient import Patient
from app.models.insurance import Insurance, InsuranceClaim
from app.schemas.insurance import (
    InsuranceCreate, InsuranceOut, ClaimCreate, ClaimOut,
    VerifyRequest, ClaimUpdate
)

router = APIRouter()

# ------------------------------------------------------------
#  Insurance Policy
# ------------------------------------------------------------

@router.post("/", response_model=InsuranceOut, status_code=201)
def add_insurance(
    data: InsuranceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Only patients can add insurance")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Validate expiry date is in the future (use timezone-aware UTC)
    now = datetime.now(timezone.utc)
    if data.valid_until < now:
        raise HTTPException(status_code=400, detail="Expiry date must be in the future")

    new_ins = Insurance(
        patient_id=patient.id,
        provider=data.provider,
        policy_number=data.policy_number,
        valid_until=data.valid_until,
        is_verified=0
    )
    db.add(new_ins)
    db.commit()
    db.refresh(new_ins)
    return new_ins


@router.get("/my", response_model=List[InsuranceOut])
def get_my_insurance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return db.query(Insurance).filter(Insurance.patient_id == patient.id).all()
    elif current_user.role.value == "ADMIN":
        return db.query(Insurance).all()
    else:
        return []


# Admin: verify insurance
@router.put("/{insurance_id}/verify", response_model=InsuranceOut)
def verify_insurance(
    insurance_id: int,
    verify: VerifyRequest,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    ins = db.query(Insurance).filter(Insurance.id == insurance_id).first()
    if not ins:
        raise HTTPException(status_code=404, detail="Insurance not found")
    ins.is_verified = verify.is_verified
    db.commit()
    db.refresh(ins)
    return ins


# ------------------------------------------------------------
#  Insurance Claims
# ------------------------------------------------------------

@router.post("/claims", response_model=ClaimOut, status_code=201)
def file_claim(
    claim: ClaimCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Only patients can file claims")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Check that the insurance belongs to this patient
    insurance = db.query(Insurance).filter(
        Insurance.id == claim.insurance_id,
        Insurance.patient_id == patient.id
    ).first()
    if not insurance:
        raise HTTPException(status_code=404, detail="Insurance not found or not yours")

    # Check if insurance is verified
    if insurance.is_verified != 1:
        raise HTTPException(status_code=400, detail="Insurance is not verified yet")

    new_claim = InsuranceClaim(
        insurance_id=claim.insurance_id,
        amount=claim.amount,
        description=claim.description or "",
        status="PENDING"
    )
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)
    return new_claim


@router.get("/claims/my", response_model=List[ClaimOut])
def get_my_claims(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        # Get claims for this patient's insurances
        ins_ids = [i.id for i in db.query(Insurance).filter(Insurance.patient_id == patient.id).all()]
        return db.query(InsuranceClaim).filter(InsuranceClaim.insurance_id.in_(ins_ids)).all()
    elif current_user.role.value == "ADMIN":
        return db.query(InsuranceClaim).all()
    else:
        return []


# Admin: update claim status (approve/reject)
@router.put("/claims/{claim_id}", response_model=ClaimOut)
def update_claim(
    claim_id: int,
    update: ClaimUpdate,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    claim = db.query(InsuranceClaim).filter(InsuranceClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if update.status not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Status must be APPROVED or REJECTED")
    claim.status = update.status
    db.commit()
    db.refresh(claim)
    return claim