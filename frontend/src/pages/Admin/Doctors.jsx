import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ===== Inline SVG Icons ===== */
const SearchIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const EditIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
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

/* ===== Simple Toast Component ===== */
function Toast({ message, type, onClose }) {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800';
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
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 border rounded-xl shadow-lg flex items-start gap-3 ${bgColor} animate-slide-in`}>
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

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  useEffect(() => {
    fetchData();
  }, []);

  // Auto dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchData = async () => {
    try {
      const [docRes, deptRes] = await Promise.all([
        api.get('/doctors/'),
        api.get('/departments/'),
      ]);
      setDoctors(docRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDept = async (doctorId) => {
    try {
      await api.put(`/doctors/${doctorId}`, {
        department_id: selectedDept ? Number(selectedDept) : null,
      });
      setToast({ message: 'Department updated', type: 'success' });
      setEditingId(null);
      fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Assignment failed', type: 'error' });
    }
  };

  const filtered = doctors.filter((doc) => {
    const query = search.toLowerCase();
    const deptName = doc.department_id
      ? departments.find((d) => d.id === doc.department_id)?.name || ''
      : '';
    return (
      doc.specialization?.toLowerCase().includes(query) ||
      doc.user_id?.toString().includes(query) ||
      doc.id?.toString().includes(query) ||
      deptName.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 sm:px-0">
      {/* Toast Notification */}
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Doctors</h1>
          <p className="text-sm text-gray-500 mt-0.5">Assign doctors to departments</p>
        </div>
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctors..."
            className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Doctors Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 8.7 9.7 8 10.563 8h.874c.863 0 1.563.7 1.563 1.563V12m0 0v1.5m0-1.5h-1.5M12 19.5V21m-3-3h6" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No doctors found</h3>
          <p className="text-sm text-gray-500">
            {search ? 'Try a different search term.' : 'There are currently no doctors registered.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const deptName = doc.department_id
              ? departments.find((d) => d.id === doc.department_id)?.name || `ID: ${doc.department_id}`
              : 'None';

            return (
              <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {doc.specialization?.charAt(0)?.toUpperCase() || 'D'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {doc.specialization || 'General Practitioner'}
                      </h3>
                      <p className="text-xs text-gray-500">ID: {doc.id}</p>
                    </div>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    doc.availability_status === 'AVAILABLE'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {doc.availability_status === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">User ID:</span>
                    <span className="font-medium">{doc.user_id}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Department:</span>
                    <span className={`font-medium ${deptName === 'None' ? 'text-gray-400' : 'text-gray-900'}`}>
                      {deptName}
                    </span>
                  </div>
                </div>

                {editingId === doc.id ? (
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">None</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAssignDept(doc.id)}
                        className="flex items-center justify-center flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        <SaveIcon />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center justify-center flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <CloseIcon />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(doc.id);
                      setSelectedDept(doc.department_id ? doc.department_id.toString() : '');
                    }}
                    className="w-full mt-3 flex items-center justify-center gap-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    <EditIcon />
                    Change Department
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