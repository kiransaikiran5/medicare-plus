from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base
from datetime import datetime

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(String(500), default="")
    timestamp = Column(DateTime, default=datetime.utcnow)