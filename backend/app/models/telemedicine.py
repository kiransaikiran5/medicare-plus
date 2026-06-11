from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
from datetime import datetime

class SessionStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    ACTIVE = "ACTIVE"
    ENDED = "ENDED"

class TelemedicineSession(Base):
    __tablename__ = "telemedicine_sessions"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    meeting_link = Column(String(500), nullable=False)    # Google Meet URL
    created_by = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    status = Column(SQLEnum(SessionStatus), default=SessionStatus.SCHEDULED)
    recording_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    appointment = relationship("Appointment", backref="telemedicine_sessions")
    doctor = relationship("Doctor", backref="telemedicine_sessions")