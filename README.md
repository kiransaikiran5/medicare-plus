# 🏥 MediCare Plus – Hospital & Appointment Management Platform

A full-stack **Hospital Management Platform** that enables patients to book appointments, consult doctors online, manage medical records, receive notifications, interact with an AI healthcare assistant, and track healthcare activities digitally.

---

## 🚀 Tech Stack

| Layer                  | Technology                        |
| ---------------------- | --------------------------------- |
| **Backend**            | FastAPI, SQLAlchemy, MySQL, JWT   |
| **Frontend**           | React (Vite), Tailwind CSS, Axios |
| **AI Assistant**       | Custom Rule-Based Chatbot         |
| **Video Consultation** | Google Meet Integration           |
| **PDF Generation**     | FPDF2                             |

---

## ✨ Features

### 🔹 Phase 1 (Modules 1–20)

* Authentication & Role-Based Access Control (Patient, Doctor, Admin)
* Patient Profile Management
* Doctor Profile Management
* Department Management
* Appointment Booking

  * Slot Validation
  * Rescheduling
  * Cancellation
* Online Consultation
* Prescription Generation (PDF Download)
* Medical Records Management
* Laboratory Test Requests & Results
* Billing & Payment Management
* Insurance Verification & Claims
* In-App Notifications
* AI Medical Assistant

  * Symptom Guidance
  * Medication Information
  * FAQs
* Doctor Reviews & Ratings
* Smart Doctor Search & Filters
* Emergency Contact Management
* Doctor Weekly Schedule Management
* Reports & PDF Downloads
* Audit Logs & Activity Tracking
* Admin Dashboard & Analytics

### 🔹 Phase 2 (Modules 21–30)

* Telemedicine Video Consultation (Google Meet)
* Dynamic Slot Booking & Calendar Scheduling
* Patient Health Tracker

  * Weight Tracking
  * Blood Pressure Monitoring
  * Sugar Level Tracking
  * Health Charts
* Medicine Reminder System
* Hospital Bed & Ward Management
* Patient Admission & Discharge Management
* Emergency Service Requests
* Enhanced AI Health Assistant
* Patient Feedback & Satisfaction Analytics
* Advanced Admin Analytics Dashboard

  * Revenue Analytics
  * Department Performance
  * Doctor Performance
  * Satisfaction Metrics

---

## 📋 Prerequisites

Before running the project, ensure you have:

* Python 3.9+
* Node.js 18+
* MySQL Server

---

## ⚙️ Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
```

### 3. Activate Virtual Environment

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

```bash
cp .env.example .env
```

Update `.env`:

```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/medicare_plus

SECRET_KEY=your-secret-key-change-me

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

RESET_TOKEN_EXPIRE_MINUTES=15
```

### 6. Run Backend Server

```bash
uvicorn app.main:app --reload
```

Backend API:

```text
http://localhost:8000
```

Swagger Documentation:

```text
http://localhost:8000/docs
```

---

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## 📁 Project Structure

```text
medicare-plus/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🔐 Default User Roles

| Role    | Email                                         | Password |
| ------- | --------------------------------------------- | -------- |
| Patient | [patient1@test.com](mailto:patient1@test.com) | pass123  |
| Doctor  | [doctor1@test.com](mailto:doctor1@test.com)   | pass123  |
| Admin   | [admin@example.com](mailto:admin@example.com) | admin123 |

> You can also register new users via the application UI or Swagger API documentation.

---

## 📊 Key Modules

| Module          | Description                         |
| --------------- | ----------------------------------- |
| Authentication  | JWT-based login and role management |
| Appointments    | Booking, rescheduling, cancellation |
| Telemedicine    | Online doctor consultations         |
| Medical Records | Patient history and reports         |
| Laboratory      | Test requests and result management |
| Billing         | Invoice and payment tracking        |
| Insurance       | Policy verification and claims      |
| Notifications   | Automated alerts and reminders      |
| AI Assistant    | Healthcare chatbot support          |
| Analytics       | Reports and administrative insights |

---

## 🔮 Future Enhancements

* Mobile Application (React Native)
* Video Call Recording
* E-Prescription Verification
* Multi-Hospital Support
* AI-Powered Disease Prediction
* Pharmacy Management Integration
* SMS & WhatsApp Notifications

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

