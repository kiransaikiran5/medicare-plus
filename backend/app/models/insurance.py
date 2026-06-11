from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Insurance(Base):
    __tablename__ = "insurances"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    provider = Column(String(100), nullable=False)
    policy_number = Column(String(50), nullable=False)
    valid_until = Column(DateTime, nullable=False)
    is_verified = Column(Integer, default=0)   # 0 = not verified, 1 = verified by admin
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", backref="insurances")

class InsuranceClaim(Base):
    __tablename__ = "insurance_claims"

    id = Column(Integer, primary_key=True, index=True)
    insurance_id = Column(Integer, ForeignKey("insurances.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text, default="")
    status = Column(String(20), default="PENDING")   # PENDING, APPROVED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)

    insurance = relationship("Insurance", backref="claims")