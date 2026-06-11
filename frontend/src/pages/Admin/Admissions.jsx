import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ===== Inline SVG Icons ===== */
const HospitalIcon = () => (
  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
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

const DischargeIcon = () => (
  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
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

export default function AdminAdmissions() {
  const [admissions, setAdmissions] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient_id: '', bed_id: '', notes: '' });
  const [dischargeId, setDischargeId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchData = async () => {
    try {
      const [admRes, bedsRes] = await Promise.all([
        api.get('/admissions/my'),
        api.get('/beds/'),
      ]);
      setAdmissions(admRes.data);
      setBeds(bedsRes.data);
    } catch (err) {
      setToast({ message: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admissions/', {
        patient_id: parseInt(form.patient_id),
        bed_id: parseInt(form.bed_id),
        notes: form.notes,
      });
      setToast({ message: 'Patient admitted', type: 'success' });
      setShowForm(false);
      setForm({ patient_id: '', bed_id: '', notes: '' });
      fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Admission failed', type: 'error' });
    }
  };

  const openDischargeModal = (id) => {
    setDischargeId(id);
  };

  const confirmDischarge = async () => {
    if (!dischargeId) return;
    try {
      await api.put(`/admissions/${dischargeId}/discharge`);
      setToast({ message: 'Patient discharged', type: 'success' });
      setDischargeId(null);
      fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Discharge failed', type: 'error' });
      setDischargeId(null);
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
          <p className="text-gray-500 text-sm">Loading admissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Discharge Confirmation Modal */}
      {dischargeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Discharge Patient</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to discharge this patient? The bed will become available again.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDischargeId(null)}
                className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDischarge}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                Discharge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admit Patient Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Admission</h2>
            <form onSubmit={handleAdmit} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Bed *</label>
                <select
                  name="bed_id"
                  value={form.bed_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                >
                  <option value="">Select an available bed</option>
                  {beds.filter(b => b.status === 'AVAILABLE').map(bed => (
                    <option key={bed.id} value={bed.id}>
                      Ward {bed.ward_id} – Bed {bed.bed_number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
                  Admit Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Patient Admissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage inpatient admissions and discharges</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center self-start sm:self-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon />
          Admit Patient
        </button>
      </div>

      {/* Admissions Grid */}
      {admissions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <HospitalIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No admissions found</h3>
          <p className="text-sm text-gray-500">Click "Admit Patient" to admit a new patient.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {admissions.map(adm => {
            const isActive = adm.status === 'ADMITTED';
            return (
              <div
                key={adm.id}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${
                  isActive ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-400'
                } p-5 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <HospitalIcon />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Admission #{adm.id}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {adm.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-700 space-y-1.5 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Patient ID</span>
                    <span className="font-mono">{adm.patient_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bed ID</span>
                    <span className="font-mono">{adm.bed_id}</span>
                  </div>
                  {adm.notes && (
                    <div>
                      <p className="text-gray-500 text-xs">Notes</p>
                      <p className="text-sm">{adm.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span>Admitted: {formatIST(adm.admission_date, true)}</span>
                  {adm.discharge_date ? (
                    <span>Discharged: {formatIST(adm.discharge_date, true)}</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>

                {isActive && (
                  <button
                    onClick={() => openDischargeModal(adm.id)}
                    className="w-full flex items-center justify-center gap-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    <DischargeIcon />
                    Discharge Patient
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}