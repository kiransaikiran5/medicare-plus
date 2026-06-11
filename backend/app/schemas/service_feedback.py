from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ServiceFeedbackBase(BaseModel):
    category: str
    rating: float = Field(ge=1, le=5)
    comment: Optional[str] = ""

class ServiceFeedbackCreate(ServiceFeedbackBase):
    pass

class ServiceFeedbackOut(ServiceFeedbackBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class FeedbackAnalytics(BaseModel):
    total_feedback: int
    average_rating: float
    category_ratings: dict   # e.g., {"Cleanliness": 4.5, "Staff": 4.2}