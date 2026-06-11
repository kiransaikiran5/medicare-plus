from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    rating = Column(Float, nullable=False)  # 1-5
    comment = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", backref="reviews")
    doctor = relationship("Doctor", backref="reviews")