import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ===== Inline SVG Icons ===== */
const AlertIcon = () => (
  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EditIcon = () => (
  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
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

const ClockIcon = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

export default function AdminEmergencyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null); // { id, priority, status }

  useEffect(() => {
    fetchRequests();
  }, []);

  // Auto‑dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchRequests = () => {
    api.get('/emergency-requests/my')
      .then(res => setRequests(res.data))
      .catch(err => setToast({ message: 'Failed to load requests', type: 'error' }))
      .finally(() => setLoading(false));
  };

  const openEditModal = (req) => {
    setEditingRequest({ id: req.id, priority: req.priority, status: req.status });
  };

  const closeEditModal = () => {
    setEditingRequest(null);
  };

  const handleUpdate = async () => {
    if (!editingRequest) return;
    const { id, priority, status } = editingRequest;
    try {
      await api.put(`/emergency-requests/${id}/update`, { priority, status });
      setToast({ message: 'Request updated', type: 'success' });
      closeEditModal();
      fetchRequests();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Update failed', type: 'error' });
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

  // Priority & Status styling
  const priorityColors = {
    CRITICAL: 'bg-red-50 text-red-700 border-red-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    LOW: 'bg-green-50 text-green-700 border-green-200',
  };

  const statusColors = {
    PENDING: 'bg-yellow-50 text-yellow-700',
    IN_PROGRESS: 'bg-blue-50 text-blue-700',
    RESOLVED: 'bg-green-50 text-green-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading emergency requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Edit Modal */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Emergency Request #{editingRequest.id}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={editingRequest.priority}
                  onChange={(e) => setEditingRequest({ ...editingRequest, priority: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm bg-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingRequest.status}
                  onChange={(e) => setEditingRequest({ ...editingRequest, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm bg-white"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 transition-colors"
                >
                  <CloseIcon />
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
                >
                  <SaveIcon />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Emergency Requests Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and update emergency requests from patients</p>
      </div>

      {/* Requests Grid */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No emergency requests found</h3>
          <p className="text-sm text-gray-500">There are currently no emergency requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requests.map(req => {
            const priorityStyle = priorityColors[req.priority] || 'bg-gray-50 text-gray-700 border-gray-200';
            const statusStyle = statusColors[req.status] || 'bg-gray-50 text-gray-700';
            const borderColor = req.priority === 'CRITICAL' || req.priority === 'HIGH' ? 'border-l-red-500' : 'border-l-red-400';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${borderColor} border-l-4 p-5 hover:shadow-md transition-shadow duration-200`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-50">
                      <AlertIcon />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Request #{req.id}</p>
                      <p className="text-xs text-gray-500">Patient #{req.patient_id}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle}`}>
                    {req.status}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {req.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityStyle}`}>
                    {req.priority}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <ClockIcon />
                    <span>{formatIST(req.created_at, true)}</span>
                  </div>
                </div>

                <button
                  onClick={() => openEditModal(req)}
                  className="w-full flex items-center justify-center gap-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-colors"
                >
                  <EditIcon />
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}