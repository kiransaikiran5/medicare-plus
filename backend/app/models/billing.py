from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    amount = Column(Float, nullable=False)
    status = Column(String(20), default="UNPAID")      # UNPAID, PAID
    payment_method = Column(String(50), nullable=True)  # e.g., CARD, CASH, ONLINE
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", backref="bills")
    appointment = relationship("Appointment", backref="bills")