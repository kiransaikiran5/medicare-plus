from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import io

from app.core.database import get_db
from app.api.deps import require_role
from app.models.user import User
from app.models.appointment import Appointment, AppointmentStatus
from app.models.medical_record import MedicalRecord
from app.models.billing import Bill
from app.schemas.report import (
    AppointmentReportItem, MedicalRecordReportItem, BillingReportItem,
    AppointmentSummary, BillingSummary
)
from app.utils.pdf import (
    generate_appointments_pdf, generate_medical_records_pdf, generate_billing_pdf
)

router = APIRouter()

# ------------------------------------------------------------
#  Appointment Reports
# ------------------------------------------------------------
@router.get("/appointments", response_model=List[AppointmentReportItem])
def get_appointment_report(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
    status_filter: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
):
    query = db.query(Appointment)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    if start_date:
        query = query.filter(Appointment.appointment_time >= start_date)
    if end_date:
        query = query.filter(Appointment.appointment_time <= end_date)
    return query.order_by(Appointment.appointment_time.desc()).all()

@router.get("/appointments/summary", response_model=AppointmentSummary)
def get_appointment_summary(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    total = db.query(Appointment).count()
    pending = db.query(Appointment).filter(Appointment.status == AppointmentStatus.PENDING).count()
    confirmed = db.query(Appointment).filter(Appointment.status == AppointmentStatus.CONFIRMED).count()
    cancelled = db.query(Appointment).filter(Appointment.status == AppointmentStatus.CANCELLED).count()
    completed = db.query(Appointment).filter(Appointment.status == AppointmentStatus.COMPLETED).count()
    return AppointmentSummary(
        total=total, pending=pending, confirmed=confirmed, cancelled=cancelled, completed=completed
    )

@router.get("/appointments/pdf")
def download_appointments_pdf(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
    status_filter: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
):
    query = db.query(Appointment)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    if start_date:
        query = query.filter(Appointment.appointment_time >= start_date)
    if end_date:
        query = query.filter(Appointment.appointment_time <= end_date)
    appointments = query.order_by(Appointment.appointment_time.desc()).all()
    pdf_bytes = generate_appointments_pdf(appointments)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=appointments_report.pdf"}
    )

# ------------------------------------------------------------
#  Medical Reports
# ------------------------------------------------------------
@router.get("/medical", response_model=List[MedicalRecordReportItem])
def get_medical_report(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
    patient_id: Optional[int] = Query(None),
    record_type: Optional[str] = Query(None),
):
    query = db.query(MedicalRecord)
    if patient_id:
        query = query.filter(MedicalRecord.patient_id == patient_id)
    if record_type:
        query = query.filter(MedicalRecord.record_type == record_type)
    return query.order_by(MedicalRecord.created_at.desc()).all()

@router.get("/medical/pdf")
def download_medical_pdf(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
    patient_id: Optional[int] = Query(None),
    record_type: Optional[str] = Query(None),
):
    query = db.query(MedicalRecord)
    if patient_id:
        query = query.filter(MedicalRecord.patient_id == patient_id)
    if record_type:
        query = query.filter(MedicalRecord.record_type == record_type)
    records = query.order_by(MedicalRecord.created_at.desc()).all()
    pdf_bytes = generate_medical_records_pdf(records)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=medical_records_report.pdf"}
    )

# ------------------------------------------------------------
#  Billing Reports
# ------------------------------------------------------------
@router.get("/billing", response_model=List[BillingReportItem])
def get_billing_report(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
    status_filter: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
):
    query = db.query(Bill)
    if status_filter:
        query = query.filter(Bill.status == status_filter)
    if start_date:
        query = query.filter(Bill.created_at >= start_date)
    if end_date:
        query = query.filter(Bill.created_at <= end_date)
    return query.order_by(Bill.created_at.desc()).all()

@router.get("/billing/summary", response_model=BillingSummary)
def get_billing_summary(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    total_bills = db.query(Bill).count()
    total_amount = db.query(func.coalesce(func.sum(Bill.amount), 0)).scalar()
    paid_amount = db.query(func.coalesce(func.sum(Bill.amount), 0)).filter(Bill.status == "PAID").scalar()
    unpaid_amount = db.query(func.coalesce(func.sum(Bill.amount), 0)).filter(Bill.status == "UNPAID").scalar()
    return BillingSummary(
        total_bills=total_bills,
        total_amount=float(total_amount),
        paid_amount=float(paid_amount),
        unpaid_amount=float(unpaid_amount)
    )

@router.get("/billing/pdf")
def download_billing_pdf(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
    status_filter: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
):
    query = db.query(Bill)
    if status_filter:
        query = query.filter(Bill.status == status_filter)
    if start_date:
        query = query.filter(Bill.created_at >= start_date)
    if end_date:
        query = query.filter(Bill.created_at <= end_date)
    bills = query.order_by(Bill.created_at.desc()).all()
    pdf_bytes = generate_billing_pdf(bills)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=billing_report.pdf"}
    )