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

const MoneyIcon = () => (
  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
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

export default function DoctorBilling() {
  const [bills, setBills] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patient_id: '',
    appointment_id: '',
    amount: '',
  });

  useEffect(() => {
    Promise.all([
      api.get('/billing/my'),
      api.get('/appointments/my'),
    ])
      .then(([billsRes, apptsRes]) => {
        setBills(billsRes.data);
        setAppointments(
          apptsRes.data.filter(
            a => a.status === 'COMPLETED' || a.status === 'CONFIRMED'
          )
        );
      })
      .catch(err => setToast({ message: 'Failed to load data', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  // Toast auto‑dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'appointment_id' && value) {
      const appt = appointments.find(a => a.id === parseInt(value));
      if (appt) {
        setForm(prev => ({
          ...prev,
          appointment_id: value,
          patient_id: appt.patient_id.toString(),
        }));
        return;
      }
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      await api.post('/billing/', {
        patient_id: parseInt(form.patient_id),
        appointment_id: form.appointment_id ? parseInt(form.appointment_id) : null,
        amount: parseFloat(form.amount),
      });
      setToast({ message: 'Bill created', type: 'success' });
      setShowForm(false);
      setForm({ patient_id: '', appointment_id: '', amount: '' });
      const res = await api.get('/billing/my');
      setBills(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Creation failed', type: 'error' });
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

  const statusColors = {
    PAID: { badge: 'bg-green-50 text-green-700', border: 'border-l-green-500' },
    PENDING: { badge: 'bg-yellow-50 text-yellow-700', border: 'border-l-yellow-500' },
    CANCELLED: { badge: 'bg-red-50 text-red-700', border: 'border-l-red-500' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading billing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Generate Bill Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Bill for Patient</h2>
            <form onSubmit={handleCreateBill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment (auto‑fill patient)
                </label>
                <select
                  name="appointment_id"
                  value={form.appointment_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                >
                  <option value="">None (enter patient manually)</option>
                  {appointments.map(appt => (
                    <option key={appt.id} value={appt.id}>
                      #{appt.id} – Patient {appt.patient_id} ({new Date(appt.appointment_time).toLocaleDateString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="e.g., 500.00"
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
                  Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Billing (Your Patients)</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generate and view bills for your patients</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center self-start sm:self-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon />
          Generate Bill
        </button>
      </div>

      {/* Bills Grid */}
      {bills.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4">
            <MoneyIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No bills found</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Click "Generate Bill" to create a new bill for a patient.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bills.map(bill => {
            const { date, time } = formatIST(bill.created_at);
            const statusColor = statusColors[bill.status] || { badge: 'bg-gray-50 text-gray-700', border: 'border-l-gray-500' };

            return (
              <div
                key={bill.id}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${statusColor.border} border-l-4 p-5 hover:shadow-lg transition-shadow duration-200`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-2 rounded-xl ${bill.status === 'PAID' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <MoneyIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">Bill #{bill.id}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor.badge}`}>
                        {bill.status}
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
                    <span className="w-28 text-gray-500 font-medium">Patient ID:</span>
                    <span className="text-gray-900">{bill.patient_id}</span>
                  </div>
                  {bill.appointment_id && (
                    <div className="flex">
                      <span className="w-28 text-gray-500 font-medium">Appointment:</span>
                      <span className="text-gray-900">#{bill.appointment_id}</span>
                    </div>
                  )}
                  <div className="flex">
                    <span className="w-28 text-gray-500 font-medium">Amount:</span>
                    <span className="font-bold text-gray-900">₹{bill.amount.toFixed(2)}</span>
                  </div>
                  {bill.status === 'PAID' && bill.payment_method && (
                    <div className="flex">
                      <span className="w-28 text-gray-500 font-medium">Payment Method:</span>
                      <span className="text-gray-900">{bill.payment_method}</span>
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