from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.middleware.audit import AuditLogMiddleware

# ---- Endpoint routers ----
from app.api.v1.endpoints import (
    auth,
    patients,
    doctors,
    departments,
    appointments,
    consultations,
    prescriptions,
    medical_records,
    lab_tests,
    billing as billing_api,          # <-- alias to avoid name clash
    insurance as insurance_api,      # <-- alias to avoid name clash
    notifications,
    ai_assistant,
    reviews,
    admin,
    emergency,
    doctor_schedule as doctor_schedule_api,
    reports,
    audit,
    telemedicine as telemedicine_api,
    doctor_slots,
    health_metrics,
    medicine_reminders,
    admissions,
    emergency_requests,
    service_feedback as service_feedback_api
)
from app.api.v1.endpoints.hospital_beds import router_wards, router_beds

# ---- Models (for table creation) ----
from app.models import (
    user,
    patient,
    doctor,
    department,
    appointment,
    consultation,
    prescription,
    medical_record,
    lab_test,
    billing,
    insurance,
    notification,
    review,
    emergency_contact,
    doctor_schedule,
    audit_log,
    telemedicine,
    health_metric,
    medicine_reminder,
    bed,
    admission,
    emergency_request,
    service_feedback                 
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MediCare Plus", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audit logging middleware
app.add_middleware(AuditLogMiddleware)

# Register routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["Patients"])
app.include_router(doctors.router, prefix="/api/v1/doctors", tags=["Doctors"])
app.include_router(departments.router, prefix="/api/v1/departments", tags=["Departments"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["Appointments"])
app.include_router(consultations.router, prefix="/api/v1/consultations", tags=["Consultations"])
app.include_router(prescriptions.router, prefix="/api/v1/prescriptions", tags=["Prescriptions"])
app.include_router(medical_records.router, prefix="/api/v1/medical-records", tags=["Medical Records"])
app.include_router(lab_tests.router, prefix="/api/v1/lab-tests", tags=["Lab Tests"])
app.include_router(billing_api.router, prefix="/api/v1/billing", tags=["Billing"])   # <-- use billing_api
app.include_router(insurance_api.router, prefix="/api/v1/insurance", tags=["Insurance"])   # <-- use insurance_api
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(ai_assistant.router, prefix="/api/v1/ai-assistant", tags=["AI Assistant"])
app.include_router(reviews.router, prefix="/api/v1/reviews", tags=["Reviews"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(emergency.router, prefix="/api/v1/emergency", tags=["Emergency"])
app.include_router(doctor_schedule_api.router, prefix="/api/v1/doctor-schedule", tags=["Doctor Schedule"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["Audit"])
app.include_router(telemedicine_api.router, prefix="/api/v1/telemedicine", tags=["Telemedicine"])
app.include_router(doctor_slots.router, prefix="/api/v1/doctors", tags=["Doctor Slots"])
app.include_router(health_metrics.router, prefix="/api/v1/health-metrics", tags=["Health Metrics"])
app.include_router(medicine_reminders.router, prefix="/api/v1/medicine-reminders", tags=["Medicine Reminders"])
app.include_router(router_wards, prefix="/api/v1", tags=["Wards"])
app.include_router(router_beds, prefix="/api/v1", tags=["Beds"])
app.include_router(admissions.router, prefix="/api/v1/admissions", tags=["Admissions"])
app.include_router(emergency_requests.router, prefix="/api/v1/emergency-requests", tags=["Emergency Requests"])
app.include_router(service_feedback_api.router, prefix="/api/v1/service-feedback", tags=["Service Feedback"])


@app.get("/")
def root():
    return {"message": "MediCare Plus API"}