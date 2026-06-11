from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict

from app.core.database import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User
from app.models.patient import Patient
from app.models.service_feedback import ServiceFeedback
from app.schemas.service_feedback import (
    ServiceFeedbackCreate, ServiceFeedbackOut, FeedbackAnalytics
)

router = APIRouter()

# ---------- Patient: submit feedback ----------
@router.post("/", response_model=ServiceFeedbackOut, status_code=201)
def submit_feedback(
    data: ServiceFeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Only patients can submit feedback")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    feedback = ServiceFeedback(
        patient_id=patient.id,
        category=data.category,
        rating=data.rating,
        comment=data.comment or ""
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback

# ---------- Patient: view own feedback ----------
@router.get("/my", response_model=List[ServiceFeedbackOut])
def get_my_feedback(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Only patients can view their feedback")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    return db.query(ServiceFeedback).filter(
        ServiceFeedback.patient_id == patient.id
    ).order_by(ServiceFeedback.created_at.desc()).all()

# ---------- Admin: view all feedback ----------
@router.get("/all", response_model=List[ServiceFeedbackOut])
def get_all_feedback(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    return db.query(ServiceFeedback).order_by(ServiceFeedback.created_at.desc()).all()

# ---------- Admin: analytics ----------
@router.get("/analytics", response_model=FeedbackAnalytics)
def get_feedback_analytics(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    total = db.query(ServiceFeedback).count()
    avg_overall = db.query(func.avg(ServiceFeedback.rating)).scalar() or 0

    # Group by category and average rating
    category_rows = db.query(
        ServiceFeedback.category,
        func.avg(ServiceFeedback.rating)
    ).group_by(ServiceFeedback.category).all()

    category_ratings = {category: round(float(avg_rating), 1) for category, avg_rating in category_rows}

    return FeedbackAnalytics(
        total_feedback=total,
        average_rating=round(float(avg_overall), 1),
        category_ratings=category_ratings
    )