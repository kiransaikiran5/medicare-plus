import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ===== Inline SVG Icons ===== */
const CalendarIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
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

const CloseIcon = () => (
  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CrossIcon = () => (
  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

export default function AdminInsurance() {
  const [insurances, setInsurances] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Verification modal state
  const [verifyAction, setVerifyAction] = useState(null); // { insuranceId, isVerified }

  // Claim action modal state
  const [claimAction, setClaimAction] = useState(null); // { claimId, status }

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

  const handleVerify = (insuranceId, isVerified) => {
    setVerifyAction({ insuranceId, isVerified });
  };

  const confirmVerify = async () => {
    if (!verifyAction) return;
    const { insuranceId, isVerified } = verifyAction;
    try {
      await api.put(`/insurance/${insuranceId}/verify`, { is_verified: isVerified ? 1 : 0 });
      setToast({ message: `Insurance ${isVerified ? 'verified' : 'unverified'} successfully`, type: 'success' });
      setVerifyAction(null);
      fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Action failed', type: 'error' });
      setVerifyAction(null);
    }
  };

  const handleClaimStatus = (claimId, status) => {
    setClaimAction({ claimId, status });
  };

  const confirmClaimStatus = async () => {
    if (!claimAction) return;
    const { claimId, status } = claimAction;
    try {
      await api.put(`/insurance/claims/${claimId}`, { status });
      setToast({ message: `Claim ${status.toLowerCase()}`, type: 'success' });
      setClaimAction(null);
      fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Action failed', type: 'error' });
      setClaimAction(null);
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

  const statusColors = {
    VERIFIED: { badge: 'bg-green-50 text-green-700', border: 'border-l-green-500' },
    PENDING: { badge: 'bg-yellow-50 text-yellow-700', border: 'border-l-yellow-500' },
    APPROVED: { badge: 'bg-green-50 text-green-700', border: 'border-l-green-500' },
    REJECTED: { badge: 'bg-red-50 text-red-700', border: 'border-l-red-500' },
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
    <div className="max-w-6xl mx-auto py-4 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Verification Modal */}
      {verifyAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${verifyAction.isVerified ? 'bg-green-100' : 'bg-red-100'}`}>
                {verifyAction.isVerified ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {verifyAction.isVerified ? 'Verify Insurance' : 'Unverify Insurance'}
              </h3>
              <p className="text-sm text-gray-500">
                {verifyAction.isVerified
                  ? 'Are you sure you want to verify this insurance policy?'
                  : 'Are you sure you want to unverify this insurance policy?'}
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setVerifyAction(null)}
                className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmVerify}
                className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-medium transition-colors shadow-sm ${
                  verifyAction.isVerified
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Status Modal */}
      {claimAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                claimAction.status === 'APPROVED' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {claimAction.status === 'APPROVED' ? <CheckIcon /> : <CrossIcon />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {claimAction.status === 'APPROVED' ? 'Approve Claim' : 'Reject Claim'}
              </h3>
              <p className="text-sm text-gray-500">
                {claimAction.status === 'APPROVED'
                  ? 'This will approve the insurance claim.'
                  : 'This will reject the insurance claim.'}
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setClaimAction(null)}
                className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClaimStatus}
                className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-medium transition-colors shadow-sm ${
                  claimAction.status === 'APPROVED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Insurance Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage insurance policies and claims</p>
      </div>

      {/* Insurance Policies Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-blue-500" />
          Insurance Policies
        </h2>
        {insurances.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <ShieldIcon />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No insurance policies</h3>
            <p className="text-sm text-gray-500">There are currently no insurance policies.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insurances.map(ins => {
              const statusColor = statusColors[ins.is_verified ? 'VERIFIED' : 'PENDING'];
              return (
                <div
                  key={ins.id}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${statusColor.border} border-l-4 p-5 hover:shadow-md transition-shadow duration-200`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-2 rounded-xl ${ins.is_verified ? 'bg-green-50' : 'bg-yellow-50'}`}>
                      <ShieldIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 truncate">{ins.provider}</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor.badge}`}>
                          {ins.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Valid until {formatIST(ins.valid_until)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 mb-4 space-y-1">
                    <div className="flex">
                      <span className="w-28 text-gray-500 font-medium">Patient ID:</span>
                      <span className="text-gray-900">{ins.patient_id}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-gray-500 font-medium">Policy Number:</span>
                      <span className="text-gray-900">{ins.policy_number}</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    {ins.is_verified ? (
                      <button
                        onClick={() => handleVerify(ins.id, 0)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        Unverify
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerify(ins.id, 1)}
                        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Insurance Claims Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-orange-500" />
          Insurance Claims
        </h2>
        {claims.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 flex items-center justify-center mb-3">
              <ClaimsIcon />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No claims filed</h3>
            <p className="text-sm text-gray-500">There are currently no insurance claims.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claims.map(claim => {
              const statusColor = statusColors[claim.status] || { badge: 'bg-gray-50 text-gray-700', border: 'border-l-gray-500' };
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

                  <div className="text-sm text-gray-700 mb-4 space-y-1">
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

                  {claim.status === 'PENDING' && (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleClaimStatus(claim.id, 'APPROVED')}
                        className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleClaimStatus(claim.id, 'REJECTED')}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}