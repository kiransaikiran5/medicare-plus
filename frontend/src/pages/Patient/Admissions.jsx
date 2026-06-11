import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ===== Inline SVG Icons ===== */
const HospitalIcon = ({ className = 'h-6 w-6 text-blue-600' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EmptyIcon = () => (
  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
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

export default function PatientAdmissions() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'discharged'

  useEffect(() => {
    fetchAdmissions();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchAdmissions = async () => {
    try {
      const res = await api.get('/admissions/my');
      setAdmissions(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Failed to load admissions', type: 'error' });
    } finally {
      setLoading(false);
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

  // Derived data
  const activeAdmissions = admissions.filter(a => a.status === 'ADMITTED');
  const dischargedAdmissions = admissions.filter(a => a.status !== 'ADMITTED');

  const filteredAdmissions = activeTab === 'active'
    ? activeAdmissions
    : activeTab === 'discharged'
      ? dischargedAdmissions
      : admissions;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl px-10 py-8 text-center shadow-2xl">
          <svg
            className="mx-auto h-10 w-10 animate-spin text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading your admissions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Header with stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-700 p-6 text-white shadow-xl mb-8 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <HospitalIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Admissions</h1>
              <p className="mt-1 text-sm text-slate-300">Your hospital stay history</p>
            </div>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{activeAdmissions.length}</p>
              <p className="text-xs text-slate-400">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{dischargedAdmissions.length}</p>
              <p className="text-xs text-slate-400">Discharged</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{admissions.length}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'discharged', label: 'Discharged' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border ${
              activeTab === tab.key
                ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200'
                : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Admissions Cards */}
      {filteredAdmissions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <EmptyIcon />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">No admissions found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {activeTab === 'active' ? 'You have no active admissions.' :
             activeTab === 'discharged' ? 'No past admissions.' :
             'Your admission records will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAdmissions.map(adm => {
            const isActive = adm.status === 'ADMITTED';
            return (
              <div
                key={adm.id}
                className={`group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-100 ${
                  isActive ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <HospitalIcon className={isActive ? 'text-green-600' : 'text-gray-600'} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Admission #{adm.id}</p>
                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {adm.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <CalendarIcon />
                        <span>{formatIST(adm.admission_date).split(',')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500">Bed ID</span>
                      <span className="font-mono font-medium text-slate-900">{adm.bed_id}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500">Admitted</span>
                      <span className="flex items-center gap-1 text-slate-700">
                        <ClockIcon />
                        {formatIST(adm.admission_date, true)}
                      </span>
                    </div>

                    {adm.discharge_date ? (
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-slate-500">Discharged</span>
                        <span className="flex items-center gap-1 text-slate-700">
                          <ClockIcon />
                          {formatIST(adm.discharge_date, true)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-slate-500">Discharged</span>
                        <span className="text-slate-400">—</span>
                      </div>
                    )}

                    {adm.notes && (
                      <div className="pt-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">Notes</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{adm.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Active indicator pulse */}
                  {isActive && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                      <span className="text-xs font-medium text-green-700">Active</span>
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