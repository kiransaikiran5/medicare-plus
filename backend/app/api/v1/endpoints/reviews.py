from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewOut

router = APIRouter()

@router.post("/", response_model=ReviewOut, status_code=201)
def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Only patients can submit reviews")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Check doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == review_in.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Optional: prevent duplicate review for same doctor from same patient?
    # For simplicity, allow multiple.

    new_review = Review(
        patient_id=patient.id,
        doctor_id=review_in.doctor_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

@router.get("/my", response_model=List[ReviewOut])
def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return db.query(Review).filter(Review.patient_id == patient.id).all()
    elif current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        return db.query(Review).filter(Review.doctor_id == doctor.id).all()
    else:  # ADMIN
        return db.query(Review).all()

@router.get("/doctor/{doctor_id}", response_model=List[ReviewOut])
def get_doctor_reviews(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    # Public endpoint – any authenticated user can view a doctor's reviews
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return db.query(Review).filter(Review.doctor_id == doctor_id).all()

@router.delete("/{review_id}", status_code=204)
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only admin can delete reviews
    if current_user.role.value != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can delete reviews")

    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return None