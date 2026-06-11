import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ===== Inline SVG Icons ===== */
const VideoIcon = () => (
  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
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

export default function PatientTelemedicine() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  // Auto‑dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/telemedicine/my');
      setSessions(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Failed to load sessions', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const joinSession = (session) => {
    if (session.meeting_link) {
      window.open(session.meeting_link, '_blank', 'noopener,noreferrer');
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
          <p className="text-gray-500 text-sm">Loading telemedicine sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Telemedicine Sessions</h1>
        <p className="text-sm text-gray-500 mt-0.5">Join your virtual consultations</p>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <VideoIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No telemedicine sessions</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Your virtual consultations will appear here once scheduled by the doctor.
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
                    <CalendarIcon />
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

              {session.meeting_link && (
                <button
                  onClick={() => joinSession(session)}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  <ExternalLinkIcon />
                  Join Call
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}