from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class BedStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    OCCUPIED = "OCCUPIED"
    MAINTENANCE = "MAINTENANCE"

class Ward(Base):
    __tablename__ = "wards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    floor = Column(String(50), nullable=True)
    description = Column(String(255), nullable=True)

    beds = relationship("Bed", back_populates="ward")

class Bed(Base):
    __tablename__ = "beds"

    id = Column(Integer, primary_key=True, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False)
    bed_number = Column(String(20), nullable=False)
    status = Column(SQLEnum(BedStatus), default=BedStatus.AVAILABLE)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)

    ward = relationship("Ward", back_populates="beds")
    patient = relationship("Patient", backref="bed_assignment")