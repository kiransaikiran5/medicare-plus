from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    medication = Column(Text, nullable=False)
    dosage = Column(String(100), nullable=False)
    instructions = Column(Text, default="")
    # No consultation_id column – the backref from Consultation handles the link
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", backref="prescriptions")
    doctor = relationship("Doctor", backref="prescriptions")