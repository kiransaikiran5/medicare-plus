import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ===== Inline SVG Icons ===== */
const HospitalIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const BedIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.5a.75.75 0 01-.75.75h-1.5A.75.75 0 016 18.75v-1.5A.75.75 0 016.75 16.5h1.5a.75.75 0 01.75.75zM18 17.25v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75zM12 15.75v1.5a.75.75 0 01-.75.75h-1.5A.75.75 0 019 17.25v-1.5A.75.75 0 019.75 15h1.5a.75.75 0 01.75.75zM12 3v3m-4.5 1.5h9M7.5 6v3" />
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

const EditIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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

export default function BedManagement() {
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('wards');

  // Ward modal
  const [showWardForm, setShowWardForm] = useState(false);
  const [wardForm, setWardForm] = useState({ name: '', floor: '', description: '' });
  const [editingWardId, setEditingWardId] = useState(null);

  // Bed modal
  const [showBedForm, setShowBedForm] = useState(false);
  const [bedForm, setBedForm] = useState({ ward_id: '', bed_number: '' });
  const [editingBedId, setEditingBedId] = useState(null);

  // Delete confirmation
  const [deleteItem, setDeleteItem] = useState(null); // { type: 'ward'|'bed', id }

  // Assign patient
  const [assignPatientId, setAssignPatientId] = useState({});

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
    setLoading(true);
    try {
      const [wardsRes, bedsRes] = await Promise.all([
        api.get('/wards/'),
        api.get('/beds/'),
      ]);
      setWards(wardsRes.data);
      setBeds(bedsRes.data);
    } catch (err) {
      setToast({ message: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ---- Ward handlers ----
  const openAddWard = () => {
    setEditingWardId(null);
    setWardForm({ name: '', floor: '', description: '' });
    setShowWardForm(true);
  };

  const openEditWard = (ward) => {
    setEditingWardId(ward.id);
    setWardForm({ name: ward.name, floor: ward.floor || '', description: ward.description || '' });
    setShowWardForm(true);
  };

  const handleWardSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWardId) {
        await api.put(`/wards/${editingWardId}`, wardForm);
        setToast({ message: 'Ward updated', type: 'success' });
      } else {
        await api.post('/wards/', wardForm);
        setToast({ message: 'Ward created', type: 'success' });
      }
      setShowWardForm(false);
      setEditingWardId(null);
      setWardForm({ name: '', floor: '', description: '' });
      fetchData();
    } catch (err) {
      setToast({ message: err.response?.data?.detail || 'Operation failed', type: 'error' });
    }
  };

  const requestDeleteWard = (id) => {
    setDeleteItem({ type: 'ward', id });
  };

  // ---- Bed handlers ----
  const openAddBed = () => {
    setEditingBedId(null);
    setBedForm({ ward_id: '', bed_number: '' });
    setShowBedForm(true);
  };

  const openEditBed = (bed) => {
    setEditingBedId(bed.id);
    setBedForm({ ward_id: bed.ward_id.toString(), bed_number: bed.bed_number });
    setShowBedForm(true);
  };

  const handleBedSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBedId) {
        await api.put(`/beds/${editingBedId}`, bedForm);
        setToast({ message: 'Bed updated', type: 'success' });
      } else {
        await api.post('/beds/', { ward_id: parseInt(bedForm.ward_id), bed_number: bedForm.bed_number });
        setToast({ message: 'Bed created', type: 'success' });
      }
      setShowBedForm(false);
      setEditingBedId(null);
      setBedForm({ ward_id: '', bed_number: '' });
      fetchData();
    } catch (err) {
      setToast({ message: err.response?.data?.detail || 'Operation failed', type: 'error' });
    }
  };

  const requestDeleteBed = (id) => {
    setDeleteItem({ type: 'bed', id });
  };

  // ---- Confirm Delete ----
  const confirmDelete = async () => {
    if (!deleteItem) return;
    const { type, id } = deleteItem;
    try {
      if (type === 'ward') {
        await api.delete(`/wards/${id}`);
        setToast({ message: 'Ward deleted', type: 'success' });
      } else {
        await api.delete(`/beds/${id}`);
        setToast({ message: 'Bed deleted', type: 'success' });
      }
      setDeleteItem(null);
      fetchData();
    } catch (err) {
      setToast({ message: err.response?.data?.detail || 'Delete failed', type: 'error' });
      setDeleteItem(null);
    }
  };

  // ---- Assign / Discharge ----
  const handleAssignPatient = async (bedId, patientId) => {
    try {
      await api.put(`/beds/${bedId}`, { patient_id: patientId ? parseInt(patientId) : null });
      setToast({ message: patientId ? 'Patient assigned' : 'Patient discharged', type: 'success' });
      fetchData();
      setAssignPatientId(prev => ({ ...prev, [bedId]: '' }));
    } catch (err) {
      setToast({ message: err.response?.data?.detail || 'Assignment failed', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading bed & ward data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete {deleteItem.type === 'ward' ? 'Ward' : 'Bed'}
              </h3>
              <p className="text-sm text-gray-500">
                {deleteItem.type === 'ward'
                  ? 'Are you sure you want to delete this ward? All beds must be removed first.'
                  : 'Are you sure you want to delete this bed?'}
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteItem(null)}
                className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ward Modal */}
      {showWardForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingWardId ? 'Edit Ward' : 'New Ward'}
            </h2>
            <form onSubmit={handleWardSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={wardForm.name}
                  onChange={e => setWardForm({ ...wardForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                <input
                  type="text"
                  value={wardForm.floor}
                  onChange={e => setWardForm({ ...wardForm, floor: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={wardForm.description}
                  onChange={e => setWardForm({ ...wardForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWardForm(false)}
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
                  {editingWardId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bed Modal */}
      {showBedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingBedId ? 'Edit Bed' : 'New Bed'}
            </h2>
            <form onSubmit={handleBedSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward *</label>
                <select
                  value={bedForm.ward_id}
                  onChange={e => setBedForm({ ...bedForm, ward_id: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                >
                  <option value="">Select ward</option>
                  {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number *</label>
                <input
                  type="text"
                  value={bedForm.bed_number}
                  onChange={e => setBedForm({ ...bedForm, bed_number: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBedForm(false)}
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
                  {editingBedId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bed & Ward Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage hospital wards and beds</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-3">
        {['wards', 'beds'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              activeTab === tab
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'wards' ? ` (${wards.length})` : ` (${beds.length})`}
          </button>
        ))}
      </div>

      {/* Wards Section */}
      {activeTab === 'wards' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Wards</h2>
            <button
              onClick={openAddWard}
              className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <PlusIcon />
              Add Ward
            </button>
          </div>

          {wards.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <HospitalIcon />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">No wards yet</h3>
              <p className="text-sm text-gray-500">Create your first ward to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wards.map(ward => (
                <div key={ward.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-50">
                        <HospitalIcon />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{ward.name}</h3>
                        <p className="text-xs text-gray-500">Floor: {ward.floor || '—'}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{ward.description || 'No description'}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditWard(ward)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      <EditIcon />
                      Edit
                    </button>
                    <button
                      onClick={() => requestDeleteWard(ward.id)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      <DeleteIcon />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Beds Section */}
      {activeTab === 'beds' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Beds</h2>
            <button
              onClick={openAddBed}
              className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <PlusIcon />
              Add Bed
            </button>
          </div>

          {beds.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-3">
                <BedIcon />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">No beds yet</h3>
              <p className="text-sm text-gray-500">Add beds to track availability.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {beds.map(bed => {
                const statusColor =
                  bed.status === 'AVAILABLE' ? 'bg-green-50 text-green-700' :
                  bed.status === 'OCCUPIED' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700';
                const wardName = wards.find(w => w.id === bed.ward_id)?.name || `Ward ${bed.ward_id}`;

                return (
                  <div key={bed.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-green-50">
                          <BedIcon />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">Bed {bed.bed_number}</h3>
                          <p className="text-xs text-gray-500">{wardName}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
                        {bed.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      <p>Patient: {bed.patient_id ? <span className="font-mono">#{bed.patient_id}</span> : 'None'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {bed.status === 'OCCUPIED' ? (
                        <button
                          onClick={() => handleAssignPatient(bed.id, null)}
                          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          Discharge
                        </button>
                      ) : (
                        <>
                          <input
                            type="number"
                            placeholder="Patient ID"
                            value={assignPatientId[bed.id] || ''}
                            onChange={e => setAssignPatientId({ ...assignPatientId, [bed.id]: e.target.value })}
                            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                          <button
                            onClick={() => handleAssignPatient(bed.id, assignPatientId[bed.id])}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Assign
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openEditBed(bed)}
                        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => requestDeleteBed(bed.id)}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}