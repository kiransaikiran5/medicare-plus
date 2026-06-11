import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ===== Inline SVG Icons ===== */
const SearchIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const StarFilledIcon = ({ className = 'h-4 w-4 text-yellow-400' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const StarEmptyIcon = ({ className = 'h-4 w-4 text-gray-300' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2zm0 2.74l-2.2 4.46-4.92.71 3.57 3.47-.84 4.92L12 15.72l4.39 2.31-.84-4.92 3.57-3.47-4.92-.71L12 4.74z" />
  </svg>
);

const StarHalfIcon = ({ className = 'h-4 w-4 text-yellow-400' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z" />
  </svg>
);

const StethoscopeIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 8.7 9.7 8 10.563 8h.874c.863 0 1.563.7 1.563 1.563V12m0 0v1.5m0-1.5h-1.5M12 19.5V21m-3-3h6" />
  </svg>
);

const CertificateIcon = () => (
  <svg className="h-4 w-4 text-gray-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-4 w-4 text-gray-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="h-4 w-4 text-gray-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
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

/* ===== Star Rating Display ===== */
function StarRating({ rating, size = 'sm' }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const iconClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  for (let i = 0; i < fullStars; i++) {
    stars.push(<StarFilledIcon key={`filled-${i}`} className={iconClass} />);
  }
  if (hasHalf) {
    stars.push(<StarHalfIcon key="half" className={iconClass} />);
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<StarEmptyIcon key={`empty-${i}`} className={iconClass} />);
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    department_id: '',
    available_only: false,
    min_rating: '',
    max_rating: '',
    min_fee: '',
    max_fee: ''
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, []);

  // Auto‑dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments/');
      setDepartments(res.data);
    } catch (err) {
      // silently ignore
    }
  };

  const fetchDoctors = async (appliedFilters = filters) => {
    try {
      setLoading(true);
      const params = {};
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.specialization) params.specialization = appliedFilters.specialization;
      if (appliedFilters.department_id) params.department_id = appliedFilters.department_id;
      if (appliedFilters.available_only) params.available_only = true;
      if (appliedFilters.min_rating) params.min_rating = appliedFilters.min_rating;
      if (appliedFilters.max_rating) params.max_rating = appliedFilters.max_rating;
      if (appliedFilters.min_fee) params.min_fee = appliedFilters.min_fee;
      if (appliedFilters.max_fee) params.max_fee = appliedFilters.max_fee;

      const res = await api.get('/doctors/', { params });
      setDoctors(res.data);
    } catch (err) {
      setToast({ message: 'Failed to load doctors', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleApplyFilters = () => {
    fetchDoctors();
  };

  const handleClearFilters = () => {
    const cleared = {
      search: '',
      specialization: '',
      department_id: '',
      available_only: false,
      min_rating: '',
      max_rating: '',
      min_fee: '',
      max_fee: ''
    };
    setFilters(cleared);
    fetchDoctors(cleared);
  };

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
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Doctors</h1>
        <p className="text-sm text-gray-500 mt-0.5">Find the right specialist for your needs</p>
      </div>

      {/* Filters Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                name="search"
                placeholder="Name or qualification"
                value={filters.search}
                onChange={handleFilterChange}
                className="pl-10 pr-3 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <StethoscopeIcon />
              </div>
              <input
                type="text"
                name="specialization"
                placeholder="e.g., Cardiologist"
                value={filters.specialization}
                onChange={handleFilterChange}
                className="pl-10 pr-3 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              name="department_id"
              value={filters.department_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="available_only"
                checked={filters.available_only}
                onChange={handleFilterChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Available only
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
            <input
              type="number"
              name="min_rating"
              min="0"
              max="5"
              step="0.1"
              placeholder="0"
              value={filters.min_rating}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Rating</label>
            <input
              type="number"
              name="max_rating"
              min="0"
              max="5"
              step="0.1"
              placeholder="5"
              value={filters.max_rating}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Fee (₹)</label>
            <input
              type="number"
              name="min_fee"
              min="0"
              step="0.01"
              placeholder="0"
              value={filters.min_fee}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Fee (₹)</label>
            <input
              type="number"
              name="max_fee"
              min="0"
              step="0.01"
              placeholder="Any"
              value={filters.max_fee}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 transition-colors"
          >
            Clear Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Doctors Grid */}
      {doctors.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <StethoscopeIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No doctors found</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Try adjusting your filters to see more results.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                  {doc.specialization?.[0] || 'D'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {doc.specialization || 'General Practitioner'}
                  </h3>
                  {doc.qualification && (
                    <p className="text-xs text-gray-500 truncate">{doc.qualification}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">Rating:</span>
                  {doc.average_rating ? (
                    <div className="flex items-center gap-1">
                      <StarRating rating={doc.average_rating} />
                      <span className="text-xs text-gray-500">({doc.average_rating.toFixed(1)})</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No ratings</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <ClockIcon />
                  <span className="font-medium">Experience:</span>
                  <span>{doc.experience} yrs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MoneyIcon />
                  <span className="font-medium">Fee:</span>
                  <span>₹{doc.consultation_fee}</span>
                </div>
                <div>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      doc.availability_status === 'AVAILABLE'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {doc.availability_status === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Additional actions could be added, like Book Appointment */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}