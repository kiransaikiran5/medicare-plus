import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ===== Inline SVG Icons (unchanged) ===== */
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

const LabIcon = () => (
  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
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

const UploadIcon = () => (
  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
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

export default function DoctorLabTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [form, setForm] = useState({ patient_id: '', test_name: '', notes: '' });
  const [selectedFiles, setSelectedFiles] = useState({});

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchTests = () => {
    api.get('/lab-tests/my')
      .then(res => setTests(res.data))
      .catch(err => setToast({ message: 'Failed to load tests', type: 'error' }))
      .finally(() => setLoading(false));
  };

  // ---------- Request Test ----------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRequestTest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lab-tests/', {
        patient_id: parseInt(form.patient_id),
        test_name: form.test_name,
        notes: form.notes,
      });
      setToast({ message: 'Test requested', type: 'success' });
      setShowRequestForm(false);
      setForm({ patient_id: '', test_name: '', notes: '' });
      fetchTests();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Request failed', type: 'error' });
    }
  };

  // ---------- File Upload ----------
  const setSelectedFile = (testId, file) => {
    setSelectedFiles(prev => ({ ...prev, [testId]: file }));
  };

  const handleUploadFile = async (testId) => {
    const file = selectedFiles[testId];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/lab-tests/${testId}/upload-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setToast({ message: 'File uploaded successfully', type: 'success' });
      setSelectedFiles(prev => ({ ...prev, [testId]: null }));
      fetchTests();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Upload failed', type: 'error' });
    }
  };

  // ---------- Download PDF ----------
  const handleDownloadPdf = (testId) => {
    try {
      const token = localStorage.getItem('token');
      const link = document.createElement('a');
      link.href = `${api.defaults.baseURL}/lab-tests/${testId}/download-result?token=${token}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setToast({ message: 'Download failed', type: 'error' });
    }
  };

  // ---------- View File (new) ----------
  const handleViewFile = (url) => {
    const token = localStorage.getItem('token');
    const separator = url.includes('?') ? '&' : '?';
    window.open(url + separator + 'token=' + token, '_blank');
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

  const statusColors = {
    REQUESTED: { badge: 'bg-yellow-50 text-yellow-700' },
    IN_PROGRESS: { badge: 'bg-blue-50 text-blue-700' },
    COMPLETED: { badge: 'bg-green-50 text-green-700' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading lab tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Request Test Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Lab Test</h2>
            <form onSubmit={handleRequestTest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID *</label>
                <input
                  type="number"
                  name="patient_id"
                  value={form.patient_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="Enter patient ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Name *</label>
                <input
                  type="text"
                  name="test_name"
                  value={form.test_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="e.g., Blood Sugar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
                  placeholder="Any special instructions"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
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
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lab Tests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Request and manage lab tests for patients</p>
        </div>
        <button
          onClick={() => setShowRequestForm(true)}
          className="flex items-center self-start sm:self-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon />
          Request Test
        </button>
      </div>

      {/* Tests Grid */}
      {tests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-purple-50 flex items-center justify-center mb-4">
            <LabIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No lab tests found</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Click "Request Test" to order a new lab test for a patient.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tests.map(test => {
            const { date, time } = formatIST(test.created_at);
            const statusColor = statusColors[test.status] || { badge: 'bg-gray-50 text-gray-700' };

            return (
              <div
                key={test.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500 p-5 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 rounded-xl bg-purple-50">
                    <LabIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{test.test_name}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor.badge}`}>
                        {test.status}
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

                <div className="text-sm text-gray-700 mb-4 space-y-1">
                  <div className="flex">
                    <span className="w-24 text-gray-500 font-medium">Patient ID:</span>
                    <span className="text-gray-900">{test.patient_id}</span>
                  </div>
                  {test.notes && (
                    <div className="flex">
                      <span className="w-24 text-gray-500 font-medium">Notes:</span>
                      <span className="text-gray-900">{test.notes}</span>
                    </div>
                  )}
                  {test.result_file_url && (
                    <div className="flex">
                      <span className="w-24 text-gray-500 font-medium">Result:</span>
                      {/* FIXED: View File link */}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleViewFile(test.result_file_url);
                        }}
                        className="text-blue-600 underline"
                      >
                        View File
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleDownloadPdf(test.id)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                  >
                    <DownloadIcon />
                    Download PDF
                  </button>

                  {test.status !== 'COMPLETED' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(test.id, e.target.files[0])}
                        className="flex-1 text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        accept=".pdf,.jpg,.png,.doc,.docx"
                      />
                      <button
                        onClick={() => handleUploadFile(test.id)}
                        disabled={!selectedFiles[test.id]}
                        className="flex items-center justify-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UploadIcon />
                        Upload
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}