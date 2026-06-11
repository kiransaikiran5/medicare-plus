from pydantic import BaseModel
from typing import List, Optional

# ----- Module 15 schemas (kept) -----
class DepartmentStat(BaseModel):
    id: int
    name: str
    doctor_count: int
    appointment_count: int

class AppointmentStatusCount(BaseModel):
    status: str
    count: int

class AdminStats(BaseModel):
    total_patients: int
    total_doctors: int
    total_appointments: int
    total_revenue: float
    department_stats: List[DepartmentStat]
    appointment_status_counts: List[AppointmentStatusCount]

# ----- New schemas for Module 30 -----
class DoctorPerformanceItem(BaseModel):
    doctor_id: int
    specialization: str
    appointments_count: int
    consultations_completed: int
    average_rating: Optional[float] = None
    total_revenue: float

class DepartmentPerformanceItem(BaseModel):
    department_id: int
    department_name: str
    doctors_count: int
    appointments_count: int
    consultations_count: int
    average_rating: Optional[float] = None
    total_revenue: float

class PatientSatisfaction(BaseModel):
    average_service_feedback: Optional[float] = None
    average_doctor_rating: Optional[float] = None

class AdvancedAdminStats(BaseModel):
    total_patients: int
    total_doctors: int
    total_appointments: int
    total_consultations: int
    total_admissions: int
    total_revenue: float
    paid_revenue: float
    unpaid_revenue: float
    department_performance: List[DepartmentPerformanceItem]
    doctor_performance: List[DoctorPerformanceItem]
    patient_satisfaction: PatientSatisfaction