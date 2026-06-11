from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.billing import Bill
from app.schemas.billing import BillCreate, BillOut, PaymentRequest
from app.models.notification import Notification          # <-- added for payment notifications


router = APIRouter()


# ---- POST / (create a bill – admin or doctor) ----
@router.post("/", response_model=BillOut, status_code=201)
def create_bill(
    bill_in: BillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only admin and doctors can create bills
    if current_user.role.value not in ["ADMIN", "DOCTOR"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    patient = db.query(Patient).filter(Patient.id == bill_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # If doctor, restrict to their own appointments (if appointment_id given)
    if current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        if bill_in.appointment_id:
            appt = db.query(Appointment).filter(Appointment.id == bill_in.appointment_id).first()
            if not appt or appt.doctor_id != doctor.id:
                raise HTTPException(status_code=403, detail="Not your appointment")

    new_bill = Bill(**bill_in.dict())
    db.add(new_bill)
    db.commit()
    db.refresh(new_bill)
    return new_bill


# ---- GET /my (list bills for current user) ----
@router.get("/my", response_model=List[BillOut])
def get_my_bills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return db.query(Bill).filter(Bill.patient_id == patient.id).all()

    elif current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        # Return bills linked to appointments belonging to this doctor
        return db.query(Bill).join(Appointment).filter(
            Appointment.doctor_id == doctor.id
        ).all()

    else:  # ADMIN
        return db.query(Bill).all()


# ---- PUT /{bill_id}/pay (patient can pay their own bill) ----
@router.put("/{bill_id}/pay", response_model=BillOut)
def pay_bill(
    bill_id: int,
    payment: PaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    if bill.status == "PAID":
        raise HTTPException(status_code=400, detail="Bill already paid")

    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or bill.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Not your bill")
    # Admin / Doctor can also pay on behalf (no extra check)

    bill.status = "PAID"
    bill.payment_method = payment.payment_method
    
    db.add(Notification(
    user_id=bill.patient.user_id,
    message=f"Payment of ${bill.amount:.2f} for bill #{bill.id} was successful via {payment.payment_method}.",
    type="PAYMENT"
    ))
    
    db.commit()
    db.refresh(bill)
    return bill


# ---- GET /{bill_id} (single bill, role‑checked) ----
@router.get("/{bill_id}", response_model=BillOut)
def get_bill(
    bill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or bill.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        # Doctor can see bills linked to their appointments
        if bill.appointment_id:
            appt = db.query(Appointment).filter(Appointment.id == bill.appointment_id).first()
            if not appt or appt.doctor_id != doctor.id:
                raise HTTPException(status_code=403, detail="Not authorized")
        else:
            # If bill has no appointment, doctor cannot view (to avoid exposing other patients)
            raise HTTPException(status_code=403, detail="Not authorized")
    # Admin can view any

    return bill