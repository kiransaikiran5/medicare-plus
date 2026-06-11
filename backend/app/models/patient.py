from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
from datetime import timezone

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String(100))
    gender = Column(String(10))
    age = Column(Integer)
    blood_group = Column(String(5))
    phone = Column(String(20))
    address = Column(String(255))
    created_at = Column(
        DateTime(timezone=True),                # maps to MySQL TIMESTAMP
        default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", backref="patient")