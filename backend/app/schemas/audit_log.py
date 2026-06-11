from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    details: str
    timestamp: datetime

    class Config:
        from_attributes = True