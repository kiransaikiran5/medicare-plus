import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import PatientDashboard from './pages/Patient/Dashboard';
import DoctorDashboard from './pages/Doctor/Dashboard';
import AdminDashboard from './pages/Admin/Dashboard';
import DoctorList from './pages/Doctor/DoctorList';
import AdminDepartments from './pages/Admin/Departments';
import AdminDoctors from './pages/Admin/Doctors';
import AppointmentsPage from './pages/Appointments/Appointments';
import BookAppointment from './pages/Appointments/BookAppointment';
import DoctorAppointments from './pages/Doctor/Appointments';
import DoctorConsultations from './pages/Doctor/Consultations';
import PatientConsultations from './pages/Patient/Consultations';
import PatientMedicalRecords from './pages/Patient/MedicalRecords';
import DoctorMedicalRecords from './pages/Doctor/MedicalRecords';
import AdminMedicalRecords from './pages/Admin/MedicalRecords';
import PatientPrescriptions from './pages/Patient/Prescriptions';
import DoctorPrescriptions from './pages/Doctor/Prescriptions';
import PatientLabTests from './pages/Patient/LabTests';
import DoctorLabTests from './pages/Doctor/LabTests';
import AdminLabTests from './pages/Admin/LabTests';
import PatientBilling from './pages/Patient/Billing';
import AdminBilling from './pages/Admin/Billing';
import DoctorBilling from './pages/Doctor/Billing';
import PatientInsurance from './pages/Patient/Insurance';
import AdminInsurance from './pages/Admin/Insurance';
import NotificationsPage from './pages/Notifications';
import AIAssistant from './pages/AIAssistant';
import PatientReviews from './pages/Patient/Reviews';
import DoctorReviews from './pages/Doctor/Reviews';
import AdminReviews from './pages/Admin/Reviews';
import PatientEmergencyContacts from './pages/Patient/EmergencyContacts';
import EmergencyPage from './pages/Emergency';
import DoctorSchedulePage from './pages/Doctor/Schedule';
import AdminReports from './pages/Admin/Reports';
import AuditLogs from './pages/Admin/AuditLogs';
import DoctorTelemedicine from './pages/Doctor/Telemedicine';
import PatientTelemedicine from './pages/Patient/Telemedicine';
import VideoRoom from './pages/VideoRoom';
import AdminTelemedicine from './pages/Admin/Telemedicine';
import HealthTracker from './pages/Patient/HealthTracker';
import PatientReminders from './pages/Patient/Reminders';
import BedManagement from './pages/Admin/BedManagement';
import BedAvailability from './pages/Doctor/BedAvailability';
import AdminAdmissions from './pages/Admin/Admissions';
import PatientAdmissions from './pages/Patient/Admissions';
import PatientEmergencyRequests from './pages/Patient/EmergencyRequests';
import AdminEmergencyRequests from './pages/Admin/EmergencyRequests';
import PatientServiceFeedback from './pages/Patient/ServiceFeedback';
import FeedbackAnalytics from './pages/Admin/FeedbackAnalytics';


// Role‑based default redirect
function RoleBasedRedirect() {
  const { user } = useAuth();
  if (user?.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
  if (user?.role === 'DOCTOR') return <Navigate to="/doctor-dashboard" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ---------- Public routes ---------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ---------- Protected routes (all roles) ---------- */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<RoleBasedRedirect />} />

            {/* Role‑specific dashboards */}
            <Route path="patient/dashboard" element={<PatientDashboard />} />
            <Route path="doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />

            {/* Public doctor list (all roles) */}
            <Route path="doctors" element={<DoctorList />} />

            {/* Appointments */}
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="book-appointment" element={<BookAppointment />} />
            <Route path="doctor/appointments" element={<DoctorAppointments />} />

            {/* Consultations */}
            <Route path="patient/consultations" element={<PatientConsultations />} />
            <Route
              path="doctor/consultations"
              element={
                <ProtectedRoute roles={['DOCTOR', 'ADMIN']}>
                  <DoctorConsultations />
                </ProtectedRoute>
              }
            />

            {/* Prescriptions */}
            <Route path="patient/prescriptions" element={<PatientPrescriptions />} />
            <Route
              path="doctor/prescriptions"
              element={
                <ProtectedRoute roles={['DOCTOR', 'ADMIN']}>
                  <DoctorPrescriptions />
                </ProtectedRoute>
              }
            />

            {/* Lab Tests */}
            <Route path="patient/lab-tests" element={<PatientLabTests />} />
            <Route
              path="doctor/lab-tests"
              element={
                <ProtectedRoute roles={['DOCTOR', 'ADMIN']}>
                  <DoctorLabTests />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/lab-tests"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminLabTests />
                </ProtectedRoute>
              }
            />

            {/* Billing */}
            <Route path="patient/billing" element={<PatientBilling />} />
            <Route
              path="admin/billing"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminBilling />
                </ProtectedRoute>
              }
            />
            <Route
              path="doctor/billing"
              element={
                <ProtectedRoute roles={['DOCTOR', 'ADMIN']}>
                  <DoctorBilling />
                </ProtectedRoute>
              }
            />

            {/* Insurance */}
            <Route path="patient/insurance" element={<PatientInsurance />} />
            <Route
              path="admin/insurance"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminInsurance />
                </ProtectedRoute>
              }
            />

            {/* Notifications (all roles) */}
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="ai-assistant" element={<AIAssistant />} />

            <Route path="patient/reviews" element={<PatientReviews />} />
            <Route path="doctor/reviews" element={<DoctorReviews />} />
            <Route
              path="admin/reviews"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="patient/emergency-contacts"
              element={
                <ProtectedRoute roles={["PATIENT"]}>
                  <PatientEmergencyContacts />
                </ProtectedRoute>
              }
            />

            <Route path="emergency" element=  {
              <ProtectedRoute roles={["PATIENT", "DOCTOR", "ADMIN"]}>
                <EmergencyPage />
              </ProtectedRoute>
            } 
            />
            <Route
              path="doctor/schedule"
              element={
                <ProtectedRoute roles={['DOCTOR']}>
                  <DoctorSchedulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/reports"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/audit"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />

            {/* Telemedicine */}
            <Route
              path="doctor/telemedicine"
              element={
                <ProtectedRoute roles={['DOCTOR']}>
                  <DoctorTelemedicine />
                </ProtectedRoute>
              }
            />
            <Route
              path="patient/telemedicine"
              element={
                <ProtectedRoute roles={['PATIENT']}>
                  <PatientTelemedicine />
                </ProtectedRoute>
              }
            />
            <Route
              path="video-room/:sessionId"
              element={<VideoRoom />}   // authentication only – backend checks authorisation
            />
            <Route
              path="admin/telemedicine"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminTelemedicine />
                </ProtectedRoute>
              }
            />
            <Route
              path="patient/health-tracker"
              element={
                <ProtectedRoute roles={['PATIENT']}>
                  <HealthTracker />
                </ProtectedRoute>
              }
            />

            <Route
              path="patient/reminders"
              element={
                <ProtectedRoute roles={['PATIENT']}>
                  <PatientReminders />
                </ProtectedRoute>
              }
            />

            <Route
              path="admin/beds"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <BedManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="doctor/beds"
              element={
                <ProtectedRoute roles={['DOCTOR', 'ADMIN']}>
                  <BedAvailability />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/admissions"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminAdmissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="patient/admissions"
              element={
                <ProtectedRoute roles={['PATIENT']}>
                  <PatientAdmissions />
                </ProtectedRoute>
              }
            />
            
            <Route path="patient/emergency-requests" element={<PatientEmergencyRequests />} />
            <Route
              path="admin/emergency-requests"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminEmergencyRequests />
                </ProtectedRoute>
              }
            />
            <Route path="patient/service-feedback" element={<PatientServiceFeedback />} />
            <Route
              path="admin/feedback-analytics"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <FeedbackAnalytics />
                </ProtectedRoute>
              }
            />
            

            {/* Medical Records */}
            <Route path="patient/medical-records" element={<PatientMedicalRecords />} />
            <Route path="doctor/medical-records" element={<DoctorMedicalRecords />} />
            <Route
              path="admin/medical-records"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminMedicalRecords />
                </ProtectedRoute>
              }
            />

            {/* Admin‑only pages */}
            <Route
              path="admin/departments"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminDepartments />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/doctors"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminDoctors />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* ---------- Catch‑all ---------- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}