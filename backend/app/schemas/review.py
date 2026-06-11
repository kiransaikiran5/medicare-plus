from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    doctor_id: int
    rating: float = Field(ge=1, le=5)
    comment: Optional[str] = ""

class ReviewCreate(ReviewBase):
    pass

class ReviewOut(ReviewBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        from_attributes = True