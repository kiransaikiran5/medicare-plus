from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class HealthMetricBase(BaseModel):
    metric_type: str
    value: float
    unit: str

class HealthMetricCreate(HealthMetricBase):
    recorded_at: Optional[datetime] = None   # if not provided, use server time

class HealthMetricOut(HealthMetricBase):
    id: int
    patient_id: int
    recorded_at: datetime

    class Config:
        from_attributes = True