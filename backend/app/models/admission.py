from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
from datetime import datetime

class AdmissionStatus(str, enum.Enum):
    ADMITTED = "ADMITTED"
    DISCHARGED = "DISCHARGED"

class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    bed_id = Column(Integer, ForeignKey("beds.id"), nullable=False)
    admission_date = Column(DateTime, default=datetime.utcnow)
    discharge_date = Column(DateTime, nullable=True)
    status = Column(SQLEnum(AdmissionStatus), default=AdmissionStatus.ADMITTED)
    notes = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", backref="admissions")
    bed = relationship("Bed", backref="admissions")