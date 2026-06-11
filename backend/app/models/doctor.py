from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    specialization = Column(String(100))
    qualification = Column(String(200))
    experience = Column(Integer)  # years
    consultation_fee = Column(Float)
    availability_status = Column(String(20), default="AVAILABLE")  # AVAILABLE, UNAVAILABLE

    user = relationship("User", backref="doctor")
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    department = relationship("Department", back_populates="doctors")