from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    record_type = Column(String(50), nullable=False)  # e.g., Diagnosis, Lab Report, Prescription
    description = Column(Text, nullable=False)
    file_url = Column(String(255), nullable=True)      # optional attachment link
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", backref="medical_records")