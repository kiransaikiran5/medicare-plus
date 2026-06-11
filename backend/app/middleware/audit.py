from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime
from app.core.security import decode_token
from app.core.database import SessionLocal
from app.models.audit_log import AuditLog

class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Only log API calls under /api/v1/ but exclude auth endpoints
        path = request.url.path
        if path.startswith("/api/v1/") and not path.startswith("/api/v1/auth"):
            token = request.headers.get("Authorization")
            user_id = None
            if token and token.startswith("Bearer "):
                payload = decode_token(token[len("Bearer "):])
                if payload and "sub" in payload:
                    try:
                        user_id = int(payload["sub"])
                    except (ValueError, TypeError):
                        pass

            # Write log to database
            db = SessionLocal()
            try:
                log_entry = AuditLog(
                    user_id=user_id,
                    action=f"{request.method} {path}",
                    details="",
                    timestamp=datetime.utcnow()
                )
                db.add(log_entry)
                db.commit()
            except Exception:
                pass   # silently fail if DB write fails
            finally:
                db.close()

        return response