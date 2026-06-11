import enum
from sqlalchemy import Column, Integer, String, Enum
from app.core.database import Base


class UserRole(str,enum.Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Integer, default=1)
    reset_token = Column(String(255), nullable=True)  # for password reset