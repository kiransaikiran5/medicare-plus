from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
from datetime import datetime

class ReminderStatus(str, enum.Enum):
    PENDING = "PENDING"
    TAKEN = "TAKEN"
    MISSED = "MISSED"

class MedicineReminder(Base):
    __tablename__ = "medicine_reminders"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medicine_name = Column(String(100), nullable=False)
    dosage = Column(String(50), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(SQLEnum(ReminderStatus), default=ReminderStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", backref="medicine_reminders")