from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# ---- Insurance ----
class InsuranceBase(BaseModel):
    provider: str
    policy_number: str
    valid_until: datetime

class InsuranceCreate(InsuranceBase):
    pass   # patient_id will be added from the logged-in patient

class InsuranceOut(InsuranceBase):
    id: int
    patient_id: int
    is_verified: int
    created_at: datetime

    class Config:
        from_attributes = True

# ---- Claim ----
class ClaimCreate(BaseModel):
    insurance_id: int
    amount: float = Field(gt=0)
    description: Optional[str] = ""

class ClaimOut(BaseModel):
    id: int
    insurance_id: int
    amount: float
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Verify insurance (admin)
class VerifyRequest(BaseModel):
    is_verified: int   # 0 or 1

# Update claim status (admin)
class ClaimUpdate(BaseModel):
    status: str        # APPROVED or REJECTED