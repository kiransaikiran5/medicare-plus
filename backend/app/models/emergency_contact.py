from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship as orm_relationship

from app.core.database import Base


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    name = Column(String(100), nullable=False)
    relationship = Column(String(50), nullable=False)
    phone = Column(String(20), nullable=False)

    patient = orm_relationship("Patient", backref="emergency_contacts")