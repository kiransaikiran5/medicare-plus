# 🏥 MediCare Plus – Hospital & Appointment Management Platform

A full‑stack Hospital Management Platform that allows patients to book appointments, consult doctors online, manage medical records, receive notifications, interact with an AI healthcare assistant, and track healthcare activities digitally.

---

## 🛠 Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | FastAPI, SQLAlchemy, MySQL, JWT     |
| Frontend | React (Vite), Tailwind CSS, Axios   |
| AI       | Rule‑based chatbot (custom)         |
| Video    | Google Meet integration             |
| PDF      | FPDF2 for report generation         |

---

## ✨ Features

### Phase 1 (Modules 1 – 20)
- Authentication & Role‑Based Access Control (Patient / Doctor / Admin)
- Patient & Doctor Profile Management
- Department Management
- Appointment Booking (slot validation, reschedule, cancel)
- Online Consultation & Prescription Generation (PDF download)
- Medical Records Management
- Laboratory Test Requests & Results
- Billing & Payments (with PDF reports)
- Insurance Management (policy verification, claims)
- In‑App Notifications (appointment, prescription, payment triggers)
- AI Medical Assistant (symptom guidance, medication info, FAQs)
- Doctor Reviews & Ratings
- Admin Dashboard & Analytics
- Smart Search & Filters for Doctors
- Emergency Contact Management
- Doctor Weekly Schedule & Slot Management
- Reports & PDF Downloads (appointments, medical, billing)
- Audit Logs & Activity Tracking

### Phase 2 (Modules 21 – 30)
- Telemedicine Video Consultation (Google Meet)
- Dynamic Slot Booking & Calendar Scheduling
- Patient Health Tracker (weight, BP, sugar, charts)
- Medicine Reminder System
- Hospital Bed & Ward Management
- Patient Admission & Discharge Management
- Emergency Service Requests (priority handling)
- Enhanced AI Health Assistant (medication lookup, symptom mapping)
- Patient Feedback & Satisfaction Analytics (charts)
- Advanced Admin Analytics Dashboard (revenue, department/doctor performance, satisfaction scores)

---

### Prerequisites
- Python 3.9+
- Node.js 18+
- MySQL Server

### Backend Setup

# Navigate to backend folder

cd backend

# Create virtual environment

python -m venv venv

# Activate it (Windows)

venv\Scripts\activate

# Install dependencies

pip install -r requirements.txt

# Copy environment file

cp .env.example .env

# Edit .env with your database credentials

# DATABASE_URL=mysql+pymysql://user:password@localhost:3306/medicare_plus

# Run the server

uvicorn app.main:app --reload

---

# Frontend Setup

# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev

---
📁 Project Structure
---
'''
medicare-plus/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
'''
---

# Environment Variables

- Copy backend/.env.example to backend/.env and fill in your values:


DATABASE_URL=mysql+pymysql://root:password@localhost:3306/medicare_plus

SECRET_KEY=your-secret-key-change-me

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

RESET_TOKEN_EXPIRE_MINUTES=15

# 📊 Default Roles

Role	Email	Password

Patient	patient1@test.com	pass123

Doctor	doctor1@test.com	pass123

Admin	admin@example.com	admin123

(Register new users via the login page or Swagger /api/v1/auth/register)
