from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class ServiceFeedback(Base):
    __tablename__ = "service_feedback"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    category = Column(String(100), nullable=False)   # e.g., Cleanliness, Staff, Overall
    rating = Column(Float, nullable=False)           # 1-5
    comment = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", backref="service_feedback")