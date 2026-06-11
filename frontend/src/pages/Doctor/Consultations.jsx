import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ===== Inline SVG Icons ===== */
const CalendarIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PatientIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const NoteIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SaveIcon = () => (
  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ===== Toast Component ===== */
function Toast({ message, type, onClose }) {
  if (!message) return null;

  const bg = type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800';
  const Icon = type === 'success' ? (
    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 border rounded-xl shadow-lg flex items-start gap-3 ${bg} animate-slide-in`}>
      {Icon}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function DoctorConsultations() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [form, setForm] = useState({
    doctor_notes: '',
    medication: '',
    dosage: '',
    instructions: '',
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/my');
      const active = res.data.filter(
        (a) => a.status === 'PENDING' || a.status === 'CONFIRMED'
      );
      setAppointments(active);
    } catch (err) {
      setToast({ message: 'Failed to load appointments', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = (appt) => {
    setSelectedAppt(appt);
    setForm({ doctor_notes: '', medication: '', dosage: '', instructions: '' });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/consultations/', {
        appointment_id: selectedAppt.id,
        doctor_notes: form.doctor_notes,
        medication: form.medication || undefined,
        dosage: form.dosage || undefined,
        instructions: form.instructions || undefined,
      });
      setToast({ message: 'Consultation saved successfully!', type: 'success' });
      setSelectedAppt(null);
      fetchAppointments();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Failed to save consultation', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Consultations</h1>
        <p className="text-sm text-gray-500 mt-0.5">Record consultations for your upcoming appointments</p>
      </div>

      {!selectedAppt ? (
        /* Appointment List */
        <>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
          {appointments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <CalendarIcon />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">No pending appointments</h3>
              <p className="text-sm text-gray-500">All appointments have been attended to.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <CalendarIcon />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(appt.appointment_time).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            timeZone: 'Asia/Kolkata',
                          })}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4" />
                          <span>
                            {new Date(appt.appointment_time).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                              timeZone: 'Asia/Kolkata',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      appt.status === 'CONFIRMED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1.5">
                      <PatientIcon className="h-4 w-4" />
                      <span className="text-gray-500">Patient ID:</span>
                      <span className="font-medium">{appt.patient_id}</span>
                    </div>
                    <p><span className="text-gray-500">Reason:</span> {appt.reason || 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => handleStartConsultation(appt)}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                  >
                    Start Consultation
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Consultation Form */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Consultation for Appointment #{selectedAppt.id}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Doctor Notes */}
            <div>
              <label htmlFor="doctor_notes" className="block text-sm font-medium text-gray-700 mb-1.5">
                Doctor Notes
              </label>
              <div className="relative">
                <div className="absolute top-2.5 left-0 pl-3.5 flex items-start pointer-events-none">
                  <NoteIcon />
                </div>
                <textarea
                  id="doctor_notes"
                  name="doctor_notes"
                  value={form.doctor_notes}
                  onChange={handleChange}
                  rows="4"
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
                  placeholder="Enter clinical notes..."
                />
              </div>
            </div>

            {/* Prescription (Optional) */}
            <fieldset className="border border-gray-200 rounded-xl p-5">
              <legend className="text-sm font-semibold text-gray-700 px-2">Prescription (optional)</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="medication" className="block text-sm font-medium text-gray-700 mb-1">
                    Medication
                  </label>
                  <input
                    type="text"
                    id="medication"
                    name="medication"
                    value={form.medication}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    placeholder="e.g., Paracetamol"
                  />
                </div>
                <div>
                  <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    id="dosage"
                    name="dosage"
                    value={form.dosage}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    placeholder="e.g., 500mg twice a day"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    id="instructions"
                    name="instructions"
                    value={form.instructions}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
                    placeholder="e.g., Take after meals"
                  />
                </div>
              </div>
            </fieldset>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedAppt(null)}
                className="flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 transition-colors"
              >
                <CloseIcon />
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
              >
                <SaveIcon />
                Save Consultation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}