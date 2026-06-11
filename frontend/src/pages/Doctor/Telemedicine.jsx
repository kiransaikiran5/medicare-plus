import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ===== Inline SVG Icons ===== */
const VideoIcon = () => (
  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const PlusIcon = () => (
  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

const ExternalLinkIcon = () => (
  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
);

const EndIcon = () => (
  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
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

export default function DoctorTelemedicine() {
  const [sessions, setSessions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ appointment_id: '', meeting_link: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchData = async () => {
    try {
      const [sessRes, apptRes] = await Promise.all([
        api.get('/telemedicine/my'),
        api.get('/appointments/my')
      ]);
      const existingApptIds = sessRes.data.map(s => s.appointment_id);
      const eligible = apptRes.data.filter(
        a => (a.status === 'CONFIRMED' || a.status === 'COMPLETED') &&
             !existingApptIds.includes(a.id)
      );
      setSessions(sessRes.data);
      setAppointments(eligible);
    } catch (err) {
      setToast({ message: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!form.appointment_id || !form.meeting_link) return;
    try {
      await api.post('/telemedicine/', {
        appointment_id: parseInt(form.appointment_id),
        meeting_link: form.meeting_link,
      });
      setToast({ message: 'Session created', type: 'success' });
      setShowCreate(false);
      setForm({ appointment_id: '', meeting_link: '' });
      fetchData(); // refresh data
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Failed to create session', type: 'error' });
    }
  };

  const joinSession = (session) => {
    if (session.meeting_link) {
      window.open(session.meeting_link, '_blank', 'noopener,noreferrer');
    }
  };

  const endSession = async (sessionId) => {
    try {
      await api.put(`/telemedicine/${sessionId}/end`);
      setToast({ message: 'Session ended', type: 'success' });
      const sessRes = await api.get('/telemedicine/my');
      setSessions(sessRes.data);
    } catch (err) {
      setToast({ message: 'Failed to end session', type: 'error' });
    }
  };

  const formatIST = (dateStr, showTime = false) => {
    if (!dateStr) return '';
    const date = dateStr.includes('+') || dateStr.includes('Z')
      ? new Date(dateStr)
      : new Date(dateStr + 'Z');
    if (showTime) {
      return date.toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZone: 'Asia/Kolkata'
      });
    }
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading telemedicine data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Create Session Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Google Meet Session</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment</label>
                <select
                  name="appointment_id"
                  value={form.appointment_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">Select an appointment</option>
                  {appointments.map(a => (
                    <option key={a.id} value={a.id}>
                      #{a.id} – Patient {a.patient_id} ({formatIST(a.appointment_time)}) [{a.status}]
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Meet Link</label>
                <input
                  type="url"
                  name="meeting_link"
                  value={form.meeting_link}
                  onChange={handleChange}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 transition-colors"
                >
                  <CloseIcon />
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!form.appointment_id || !form.meeting_link}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SaveIcon />
                  Create Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Telemedicine Sessions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage virtual consultations with patients</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center self-start sm:self-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon />
          Create Session
        </button>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <VideoIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No telemedicine sessions</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Create a session from an appointment to start a virtual consultation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sessions.map(session => (
            <div
              key={session.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-500 p-5 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-xl bg-indigo-50">
                  <VideoIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Session #{session.id}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      session.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                      session.status === 'ENDED' ? 'bg-gray-50 text-gray-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatIST(session.created_at, true)}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-700 mb-4 space-y-1">
                <div className="flex">
                  <span className="w-28 text-gray-500 font-medium">Room:</span>
                  <span className="font-mono text-gray-900">{session.room_name}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-500 font-medium">Appointment:</span>
                  <span className="text-gray-900">#{session.appointment_id}</span>
                </div>
                {session.meeting_link && (
                  <div className="flex">
                    <span className="w-28 text-gray-500 font-medium">Link:</span>
                    <span className="text-blue-600 truncate">{session.meeting_link}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                {session.meeting_link && (
                  <button
                    onClick={() => joinSession(session)}
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                  >
                    <ExternalLinkIcon />
                    Join
                  </button>
                )}
                {session.status !== 'ENDED' && (
                  <button
                    onClick={() => endSession(session.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    <EndIcon />
                    End
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}