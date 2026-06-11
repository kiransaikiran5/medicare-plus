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

const ShieldIcon = () => (
  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const ClaimsIcon = () => (
  <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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

export default function PatientInsurance() {
  const [insurances, setInsurances] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ provider: '', policy_number: '', valid_until: '' });

  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimForm, setClaimForm] = useState({ insurance_id: '', amount: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/insurance/my'),
      api.get('/insurance/claims/my')
    ])
      .then(([insRes, claimsRes]) => {
        setInsurances(insRes.data);
        setClaims(claimsRes.data);
      })
      .catch(err => setToast({ message: 'Failed to load insurance data', type: 'error' }))
      .finally(() => setLoading(false));
  };

  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        provider: addForm.provider,
        policy_number: addForm.policy_number,
        valid_until: new Date(addForm.valid_until).toISOString()
      };
      await api.post('/insurance/', payload);
      setToast({ message: 'Insurance policy added', type: 'success' });
      setShowAddForm(false);
      setAddForm({ provider: '', policy_number: '', valid_until: '' });
      fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Failed to add insurance', type: 'error' });
    }
  };

  const handleClaimChange = (e) => {
    setClaimForm({ ...claimForm, [e.target.name]: e.target.value });
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/insurance/claims', {
        insurance_id: parseInt(claimForm.insurance_id),
        amount: parseFloat(claimForm.amount),
        description: claimForm.description,
      });
      setToast({ message: 'Claim filed successfully', type: 'success' });
      setShowClaimForm(false);
      setClaimForm({ insurance_id: '', amount: '', description: '' });
      fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Failed to file claim', type: 'error' });
    }
  };

  const formatIST = (dateStr) => {
    if (!dateStr) return '';
    const date = dateStr.includes('+') || dateStr.includes('Z')
      ? new Date(dateStr)
      : new Date(dateStr + 'Z');
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
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
          <p className="text-gray-500 text-sm">Loading insurance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Add Insurance Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Insurance Policy</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
                <input
                  type="text"
                  name="provider"
                  value={addForm.provider}
                  onChange={handleAddChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="e.g., Star Health"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number *</label>
                <input
                  type="text"
                  name="policy_number"
                  value={addForm.policy_number}
                  onChange={handleAddChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="e.g., SH-12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until *</label>
                <input
                  type="datetime-local"
                  name="valid_until"
                  value={addForm.valid_until}
                  onChange={handleAddChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
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
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Claim Modal */}
      {showClaimForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">File an Insurance Claim</h2>
            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Policy *</label>
                <select
                  name="insurance_id"
                  value={claimForm.insurance_id}
                  onChange={handleClaimChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                >
                  <option value="">Select a policy</option>
                  {insurances.filter(i => i.is_verified).map(ins => (
                    <option key={ins.id} value={ins.id}>
                      {ins.provider} (#{ins.policy_number})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={claimForm.amount}
                  onChange={handleClaimChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="e.g., 5000.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={claimForm.description}
                  onChange={handleClaimChange}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
                  placeholder="Reason for claim"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimForm(false)}
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
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Insurance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your insurance policies and claims</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon />
          Add Insurance
        </button>
        <button
          onClick={() => setShowClaimForm(true)}
          className="flex items-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon />
          File a Claim
        </button>
      </div>

      {/* Insurance Policies Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-blue-500" />
          My Insurance Policies
        </h2>
        {insurances.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <ShieldIcon />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No policies added</h3>
            <p className="text-sm text-gray-500">Click "Add Insurance" to add a new policy.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insurances.map(ins => (
              <div
                key={ins.id}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${ins.is_verified ? 'border-l-green-500' : 'border-l-yellow-500'} border-l-4 p-5 hover:shadow-md transition-shadow duration-200`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-2 rounded-xl ${ins.is_verified ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <ShieldIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 truncate">{ins.provider}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${ins.is_verified ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        {ins.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Valid until {formatIST(ins.valid_until)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  <div className="flex">
                    <span className="w-28 text-gray-500 font-medium">Policy Number:</span>
                    <span className="text-gray-900">{ins.policy_number}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claims Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-orange-500" />
          My Claims
        </h2>
        {claims.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 flex items-center justify-center mb-3">
              <ClaimsIcon />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No claims filed</h3>
            <p className="text-sm text-gray-500">Click "File a Claim" to submit a new claim.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claims.map(claim => {
              const statusColor = {
                APPROVED: { badge: 'bg-green-50 text-green-700', border: 'border-l-green-500' },
                REJECTED: { badge: 'bg-red-50 text-red-700', border: 'border-l-red-500' },
                PENDING: { badge: 'bg-yellow-50 text-yellow-700', border: 'border-l-yellow-500' },
              }[claim.status] || { badge: 'bg-gray-50 text-gray-700', border: 'border-l-gray-500' };

              return (
                <div
                  key={claim.id}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${statusColor.border} border-l-4 p-5 hover:shadow-md transition-shadow duration-200`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-2 rounded-xl ${claim.status === 'APPROVED' ? 'bg-green-50' : claim.status === 'REJECTED' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                      <ClaimsIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">Claim #{claim.id}</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor.badge}`}>
                          {claim.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                        <span>Insurance ID: {claim.insurance_id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div className="flex">
                      <span className="w-28 text-gray-500 font-medium">Amount:</span>
                      <span className="font-bold text-gray-900">₹{claim.amount.toFixed(2)}</span>
                    </div>
                    {claim.description && (
                      <div className="flex">
                        <span className="w-28 text-gray-500 font-medium">Description:</span>
                        <span className="text-gray-900">{claim.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}