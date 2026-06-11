from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class HealthMetric(Base):
    __tablename__ = "health_metrics"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    metric_type = Column(String(50), nullable=False)   # weight, height, systolic_bp, diastolic_bp, sugar
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)          # kg, cm, mmHg, mg/dL
    recorded_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", backref="health_metrics")