from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import require_role
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment, AppointmentStatus
from app.models.consultation import Consultation
from app.models.admission import Admission
from app.models.billing import Bill
from app.models.review import Review
from app.models.service_feedback import ServiceFeedback
from app.models.department import Department
from app.schemas.admin import (
    AdminStats, DepartmentStat, AppointmentStatusCount,
    AdvancedAdminStats, DepartmentPerformanceItem,
    DoctorPerformanceItem, PatientSatisfaction
)

router = APIRouter()

# ----------------------------------------------------------------
#  Original Module 15 stats (unchanged)
# ----------------------------------------------------------------
@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    total_patients = db.query(Patient).count()
    total_doctors = db.query(Doctor).count()
    total_appointments = db.query(Appointment).count()
    total_revenue = db.query(func.coalesce(func.sum(Bill.amount), 0)).filter(Bill.status == "PAID").scalar()

    departments = db.query(Department).all()
    dept_stats = []
    for dept in departments:
        doctor_count = db.query(Doctor).filter(Doctor.department_id == dept.id).count()
        appointment_count = db.query(Appointment).filter(Appointment.department_id == dept.id).count()
        dept_stats.append(DepartmentStat(
            id=dept.id, name=dept.name,
            doctor_count=doctor_count, appointment_count=appointment_count
        ))

    status_counts = []
    for status in AppointmentStatus:
        count = db.query(Appointment).filter(Appointment.status == status).count()
        status_counts.append(AppointmentStatusCount(status=status.value, count=count))

    return AdminStats(
        total_patients=total_patients,
        total_doctors=total_doctors,
        total_appointments=total_appointments,
        total_revenue=float(total_revenue),
        department_stats=dept_stats,
        appointment_status_counts=status_counts
    )

# ----------------------------------------------------------------
#  New Advanced Stats (Module 30)
# ----------------------------------------------------------------
@router.get("/advanced-stats", response_model=AdvancedAdminStats)
def get_advanced_stats(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    # Basic counts
    total_patients = db.query(Patient).count()
    total_doctors = db.query(Doctor).count()
    total_appointments = db.query(Appointment).count()
    total_consultations = db.query(Consultation).count()
    total_admissions = db.query(Admission).count()

    # Revenue breakdown
    total_revenue = db.query(func.coalesce(func.sum(Bill.amount), 0)).scalar()
    paid_revenue = db.query(func.coalesce(func.sum(Bill.amount), 0)).filter(Bill.status == "PAID").scalar()
    unpaid_revenue = db.query(func.coalesce(func.sum(Bill.amount), 0)).filter(Bill.status == "UNPAID").scalar()

    # ----- Department Performance -----
    departments = db.query(Department).all()
    dept_perf = []
    for dept in departments:
        doctors_in_dept = db.query(Doctor).filter(Doctor.department_id == dept.id).all()
        doctor_ids = [d.id for d in doctors_in_dept]
        doctors_count = len(doctor_ids)

        appts = db.query(Appointment).filter(Appointment.department_id == dept.id)
        appointments_count = appts.count()
        appt_ids = [a.id for a in appts.all()]

        consultations_count = db.query(Consultation).filter(Consultation.appointment_id.in_(appt_ids)).count() if appt_ids else 0

        avg_rating = db.query(func.avg(Review.rating)).filter(Review.doctor_id.in_(doctor_ids)).scalar() if doctor_ids else None

        dept_revenue = db.query(func.coalesce(func.sum(Bill.amount), 0)).filter(Bill.appointment_id.in_(appt_ids)).scalar() if appt_ids else 0.0

        dept_perf.append(DepartmentPerformanceItem(
            department_id=dept.id,
            department_name=dept.name,
            doctors_count=doctors_count,
            appointments_count=appointments_count,
            consultations_count=consultations_count,
            average_rating=round(float(avg_rating), 2) if avg_rating else None,
            total_revenue=float(dept_revenue)
        ))

    # ----- Doctor Performance -----
    doctors = db.query(Doctor).all()
    doc_perf = []
    for doc in doctors:
        appt_count = db.query(Appointment).filter(Appointment.doctor_id == doc.id).count()
        completed_cons = db.query(Consultation).join(Appointment).filter(Appointment.doctor_id == doc.id).count()

        avg_rating = db.query(func.avg(Review.rating)).filter(Review.doctor_id == doc.id).scalar()

        appt_ids_doc = [a.id for a in db.query(Appointment).filter(Appointment.doctor_id == doc.id).all()]
        doc_revenue = db.query(func.coalesce(func.sum(Bill.amount), 0)).filter(Bill.appointment_id.in_(appt_ids_doc)).scalar() if appt_ids_doc else 0.0

        doc_perf.append(DoctorPerformanceItem(
            doctor_id=doc.id,
            specialization=doc.specialization or "General",
            appointments_count=appt_count,
            consultations_completed=completed_cons,
            average_rating=round(float(avg_rating), 2) if avg_rating else None,
            total_revenue=float(doc_revenue)
        ))

    # ----- Patient Satisfaction -----
    avg_service_feedback = db.query(func.avg(ServiceFeedback.rating)).scalar()
    avg_doctor_rating = db.query(func.avg(Review.rating)).scalar()

    satisfaction = PatientSatisfaction(
        average_service_feedback=round(float(avg_service_feedback), 2) if avg_service_feedback else None,
        average_doctor_rating=round(float(avg_doctor_rating), 2) if avg_doctor_rating else None
    )

    return AdvancedAdminStats(
        total_patients=total_patients,
        total_doctors=total_doctors,
        total_appointments=total_appointments,
        total_consultations=total_consultations,
        total_admissions=total_admissions,
        total_revenue=float(total_revenue),
        paid_revenue=float(paid_revenue),
        unpaid_revenue=float(unpaid_revenue),
        department_performance=dept_perf,
        doctor_performance=doc_perf,
        patient_satisfaction=satisfaction
    )