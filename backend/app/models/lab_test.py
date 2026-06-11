from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class LabTest(Base):
    __tablename__ = "lab_tests"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    test_name = Column(String(100), nullable=False)
    status = Column(String(20), default="REQUESTED")   # REQUESTED, IN_PROGRESS, COMPLETED
    result_file_url = Column(String(255), nullable=True)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", backref="lab_tests")
    doctor = relationship("Doctor", backref="lab_tests")