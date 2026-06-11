from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User
from app.models.patient import Patient
from app.models.bed import Ward, Bed, BedStatus
from app.schemas.bed import (
    WardCreate, WardOut,
    BedCreate, BedUpdate, BedOut
)

router_wards = APIRouter(prefix="/wards", tags=["Wards"])
router_beds = APIRouter(prefix="/beds", tags=["Beds"])

# -------------------------------------------------------------
#  WARDS
# -------------------------------------------------------------
@router_wards.get("/", response_model=List[WardOut])
def list_wards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Any authenticated user can view wards."""
    return db.query(Ward).all()

@router_wards.post("/", response_model=WardOut, status_code=201)
def create_ward(
    data: WardCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    existing = db.query(Ward).filter(Ward.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ward name already exists")
    ward = Ward(**data.dict())
    db.add(ward)
    db.commit()
    db.refresh(ward)
    return ward

@router_wards.put("/{ward_id}", response_model=WardOut)
def update_ward(
    ward_id: int,
    data: WardCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(ward, field, value)
    db.commit()
    db.refresh(ward)
    return ward

@router_wards.delete("/{ward_id}", status_code=204)
def delete_ward(
    ward_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")
    # optionally reassign or delete beds? We'll block if there are beds.
    if ward.beds:
        raise HTTPException(status_code=400, detail="Cannot delete ward with existing beds")
    db.delete(ward)
    db.commit()
    return None

# -------------------------------------------------------------
#  BEDS
# -------------------------------------------------------------
@router_beds.get("/", response_model=List[BedOut])
def list_beds(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    ward_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None)
):
    """Any authenticated user can view beds, optionally filtered by ward and status."""
    query = db.query(Bed)
    if ward_id:
        query = query.filter(Bed.ward_id == ward_id)
    if status:
        try:
            bed_status = BedStatus(status)
            query = query.filter(Bed.status == bed_status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")
    return query.all()

@router_beds.post("/", response_model=BedOut, status_code=201)
def create_bed(
    data: BedCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    ward = db.query(Ward).filter(Ward.id == data.ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")
    bed = Bed(**data.dict())
    db.add(bed)
    db.commit()
    db.refresh(bed)
    return bed

@router_beds.put("/{bed_id}", response_model=BedOut)
def update_bed(
    bed_id: int,
    data: BedUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    bed = db.query(Bed).filter(Bed.id == bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")

    update_data = data.dict(exclude_unset=True)

    # If trying to assign a patient, verify patient exists
    if "patient_id" in update_data and update_data["patient_id"] is not None:
        patient = db.query(Patient).filter(Patient.id == update_data["patient_id"]).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        # Optionally, unassign from any other bed?
        # For simplicity, we just set it.
        update_data["status"] = BedStatus.OCCUPIED   # force status when assigning patient
    elif "patient_id" in update_data and update_data["patient_id"] is None:
        # Discharging patient – set bed to AVAILABLE
        update_data["status"] = BedStatus.AVAILABLE

    for field, value in update_data.items():
        setattr(bed, field, value)

    db.commit()
    db.refresh(bed)
    return bed

@router_beds.delete("/{bed_id}", status_code=204)
def delete_bed(
    bed_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    bed = db.query(Bed).filter(Bed.id == bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    if bed.patient_id:
        raise HTTPException(status_code=400, detail="Cannot delete an occupied bed")
    db.delete(bed)
    db.commit()
    return None