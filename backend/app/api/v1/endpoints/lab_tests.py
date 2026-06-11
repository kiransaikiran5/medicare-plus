from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import io

from app.core.database import get_db
from app.core.security import decode_token
from app.api.deps import get_current_user
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.lab_test import LabTest
from app.models.notification import Notification          # <-- added
from app.schemas.lab_test import LabTestCreate, LabTestUpdate, LabTestOut
from app.utils.pdf import generate_lab_test_pdf

router = APIRouter()

# ------------------------------------------------------------
# Helper: allow token from query param OR Authorization header
# ------------------------------------------------------------
def get_current_user_from_query_or_header(
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> User:
    # Try header first (via the standard dependency)
    from fastapi.security import OAuth2PasswordBearer
    oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)
    try:
        return get_current_user(token=token, db=db)   # might fail if header missing
    except HTTPException:
        pass

    # Fallback: use token from query parameter
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token subject")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="User not found or inactive")
    return user


# ------------------------------------------------------------
# 1. List own lab tests
# ------------------------------------------------------------
@router.get("/my", response_model=List[LabTestOut])
def get_my_tests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return db.query(LabTest).filter(LabTest.patient_id == patient.id).all()
    elif current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        return db.query(LabTest).filter(LabTest.doctor_id == doctor.id).all()
    else:  # ADMIN
        return db.query(LabTest).all()


# ------------------------------------------------------------
# 2. Request a new lab test
# ------------------------------------------------------------
@router.post("/", response_model=LabTestOut, status_code=201)
def create_lab_test(
    test_in: LabTestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Patients can request a test for themselves only
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        test_in.patient_id = patient.id

    elif current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        if not test_in.doctor_id:
            test_in.doctor_id = doctor.id

    # Validate patient exists
    if test_in.patient_id is None:
        raise HTTPException(status_code=400, detail="Patient ID is required")
    patient = db.query(Patient).filter(Patient.id == test_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    new_test = LabTest(
        patient_id=test_in.patient_id,
        doctor_id=test_in.doctor_id,
        test_name=test_in.test_name,
        notes=test_in.notes or "",
        status="REQUESTED"
    )
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    return new_test


# ------------------------------------------------------------
# 3. Get a single lab test by ID
# ------------------------------------------------------------
@router.get("/{test_id}", response_model=LabTestOut)
def get_lab_test(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    test = db.query(LabTest).filter(LabTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    # Role-based access
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or test.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or test.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    return test


# ------------------------------------------------------------
# 4. Update a lab test (doctor/admin)
# ------------------------------------------------------------
@router.put("/{test_id}", response_model=LabTestOut)
def update_lab_test(
    test_id: int,
    update: LabTestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value not in ["DOCTOR", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Only doctors and admins can update tests")

    test = db.query(LabTest).filter(LabTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    if current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or test.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not your requested test")

    update_data = update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(test, field, value)

    db.commit()
    db.refresh(test)
    return test


# ------------------------------------------------------------
# 5. Upload a result file (doctor/admin only)
# ------------------------------------------------------------
@router.post("/{test_id}/upload-file")
async def upload_lab_result_file(
    test_id: int,
    file: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value not in ["DOCTOR", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Only doctors and admins can upload results")

    test = db.query(LabTest).filter(LabTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    if current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or test.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not your requested test")

    # Save file locally
    file_location = f"uploaded_files/lab_test_{test_id}_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Update test record
    test.result_file_url = f"/api/v1/lab-tests/{test_id}/file/{file.filename}"
    if notes:
        test.notes = notes
    test.status = "COMPLETED"

    # ---- Notification for the patient ----
    db.add(Notification(
        user_id=test.patient_id,                # the patient who requested the test
        message=f"Your lab test '{test.test_name}' result has been uploaded.",
        type="LAB_RESULT"
    ))

    db.commit()
    db.refresh(test)

    return {"message": "File uploaded successfully", "file_url": test.result_file_url}


# ------------------------------------------------------------
# 6. Download an uploaded file (with query‑param token support)
# ------------------------------------------------------------
@router.get("/{test_id}/file/{filename}")
async def get_uploaded_file(
    test_id: int,
    filename: str,
    current_user: User = Depends(get_current_user_from_query_or_header),
    db: Session = Depends(get_db)
):
    test = db.query(LabTest).filter(LabTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    # Access control
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or test.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or test.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    file_path = f"uploaded_files/lab_test_{test_id}_{filename}"
    return FileResponse(file_path, media_type="application/octet-stream", filename=filename)


# ------------------------------------------------------------
# 7. Download lab test report as PDF (with query‑param token support)
# ------------------------------------------------------------
@router.get("/{test_id}/download-result")
def download_lab_test_result(
    test_id: int,
    current_user: User = Depends(get_current_user_from_query_or_header),
    db: Session = Depends(get_db)
):
    test = db.query(LabTest).filter(LabTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    # Role check
    if current_user.role.value == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or test.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role.value == "DOCTOR":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or test.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    pdf_bytes = generate_lab_test_pdf(test)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=lab_test_{test.id}.pdf"}
    )