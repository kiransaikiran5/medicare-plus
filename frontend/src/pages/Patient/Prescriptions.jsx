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

const PrescriptionIcon = () => (
  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
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

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get('/prescriptions/my');
      setPrescriptions(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Failed to load prescriptions', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (prescriptionId) => {
    try {
      const response = await api.get(`/prescriptions/${prescriptionId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setToast({ message: 'Failed to download prescription', type: 'error' });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading prescriptions...</p>
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="text-sm text-gray-500 mt-0.5">View and download your prescribed medications</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4">
            <PrescriptionIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No prescriptions yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Your prescribed medications will appear here after a doctor's consultation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {prescriptions.map(pres => {
            const { date, time } = formatIST(pres.created_at);

            return (
              <div
                key={pres.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 p-5 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 rounded-xl bg-green-50 bg-opacity-50">
                    <PrescriptionIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">#{pres.id}</p>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                        Prescription
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{date}</span>
                      <ClockIcon className="h-4 w-4 ml-2" />
                      <span>{time}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="flex">
                    <span className="w-24 text-gray-500 font-medium">Medication:</span>
                    <span className="text-gray-900">{pres.medication}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500 font-medium">Dosage:</span>
                    <span className="text-gray-900">{pres.dosage}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500 font-medium">Instructions:</span>
                    <span className="text-gray-900">{pres.instructions}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(pres.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  <DownloadIcon />
                  Download PDF
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}