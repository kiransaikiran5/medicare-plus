from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.deps import require_role
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogOut

router = APIRouter()

@router.get("/", response_model=List[AuditLogOut])
def get_audit_logs(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    user_id: Optional[int] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
):
    query = db.query(AuditLog)
    if user_id is not None:
        query = query.filter(AuditLog.user_id == user_id)
    if start_date:
        query = query.filter(AuditLog.timestamp >= start_date)
    if end_date:
        query = query.filter(AuditLog.timestamp <= end_date)

    return query.order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()