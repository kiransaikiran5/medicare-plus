import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ===== Icons (medical themed) ===== */
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

const DiagnosisIcon = () => (
  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LabIcon = () => (
  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  </svg>
);

const PrescriptionIcon = () => (
  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
  </svg>
);

const DefaultIcon = () => (
  <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const AttachmentIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
  </svg>
);

/* ===== Toast Component (unchanged) ===== */
function Toast({ message, type, onClose }) { /* ... same as before ... */ }

export default function PatientMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/medical-records/my');
      setRecords(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Failed to load records', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatIST = (dateStr) => {
    if (!dateStr) return { date: '', time: '' };
    const date = dateStr.includes('+') || dateStr.includes('Z')
      ? new Date(dateStr)
      : new Date(dateStr + 'Z');
    return {
      date: date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      }),
    };
  };

  // Filter records based on active tab
  const filteredRecords = activeTab === 'All' 
    ? records 
    : records.filter(r => r.record_type === activeTab);

  // Get available types for tabs
  const types = ['All', ...new Set(records.map(r => r.record_type).filter(Boolean))];

  // Visual mapping for each type
  const recordMeta = {
    Diagnosis: { icon: <DiagnosisIcon />, border: 'border-l-blue-500', dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700' },
    'Lab Report': { icon: <LabIcon />, border: 'border-l-purple-500', dot: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700' },
    Prescription: { icon: <PrescriptionIcon />, border: 'border-l-green-500', dot: 'bg-green-500', badge: 'bg-green-50 text-green-700' },
  };
  const defaultMeta = { icon: <DefaultIcon />, border: 'border-l-gray-400', dot: 'bg-gray-400', badge: 'bg-gray-50 text-gray-700' };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 sm:px-0">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Medical Records</h1>
        <p className="text-sm text-gray-500 mt-1">View your complete medical history</p>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <DefaultIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No medical records yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Your consultation notes, prescriptions, and lab reports will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  activeTab === type
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Records Grid */}
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
              <p className="text-gray-500">No records for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredRecords.map(rec => {
                const meta = recordMeta[rec.record_type] || defaultMeta;
                const { date, time } = formatIST(rec.created_at);

                return (
                  <div
                    key={rec.id}
                    className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${meta.border} border-l-4 p-5 hover:shadow-lg transition-shadow duration-200`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-2 rounded-xl ${meta.badge} bg-opacity-10`}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">{date}</p>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.badge}`}>
                            {rec.record_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                          <ClockIcon className="h-4 w-4" />
                          <span>{time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {rec.description || 'No description provided.'}
                      </p>
                    </div>

                    {rec.file_url && (
                      <a
                        href={rec.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-blue-600 rounded-lg text-xs font-semibold transition-colors border border-gray-200 shadow-sm"
                      >
                        <AttachmentIcon />
                        View Attachment
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}