from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.patient import Patient
from app.models.health_metric import HealthMetric
from app.schemas.health_metric import HealthMetricCreate, HealthMetricOut

router = APIRouter()

@router.post("/", response_model=HealthMetricOut, status_code=201)
def add_health_metric(
    data: HealthMetricCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Only patients can add health metrics")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Validate metric type
    valid_types = ["weight", "height", "systolic_bp", "diastolic_bp", "sugar"]
    if data.metric_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid metric type. Allowed: {valid_types}")

    recorded = data.recorded_at or datetime.utcnow()
    metric = HealthMetric(
        patient_id=patient.id,
        metric_type=data.metric_type,
        value=data.value,
        unit=data.unit,
        recorded_at=recorded
    )
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric

@router.get("/my", response_model=List[HealthMetricOut])
def get_my_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    metric_type: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500)
):
    if current_user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Only patients can view health metrics")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    query = db.query(HealthMetric).filter(HealthMetric.patient_id == patient.id)
    if metric_type:
        query = query.filter(HealthMetric.metric_type == metric_type)

    return query.order_by(HealthMetric.recorded_at.desc()).limit(limit).all()