from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AppointmentReportItem(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_time: datetime
    status: str
    reason: str

    class Config:
        from_attributes = True

class MedicalRecordReportItem(BaseModel):
    id: int
    patient_id: int
    record_type: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True

class BillingReportItem(BaseModel):
    id: int
    patient_id: int
    amount: float
    status: str
    payment_method: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AppointmentSummary(BaseModel):
    total: int
    pending: int
    confirmed: int
    cancelled: int
    completed: int

class BillingSummary(BaseModel):
    total_bills: int
    total_amount: float
    paid_amount: float
    unpaid_amount: float