from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BillBase(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    amount: float = Field(gt=0)  # must be positive

class BillCreate(BillBase):
    pass

class BillOut(BillBase):
    id: int
    status: str
    payment_method: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentRequest(BaseModel):
    payment_method: str = Field(..., example="CARD")  # CARD, CASH, ONLINE