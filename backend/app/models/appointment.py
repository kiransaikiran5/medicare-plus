from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
from datetime import datetime

class AppointmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    appointment_time = Column(DateTime, nullable=False)
    status = Column(SQLEnum(AppointmentStatus), default=AppointmentStatus.PENDING)
    reason = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", backref="appointments")
    doctor = relationship("Doctor", backref="appointments")
    department = relationship("Department", backref="appointments")