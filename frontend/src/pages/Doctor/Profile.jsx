import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/* ===== Inline SVG Icons ===== */
const StethoscopeIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 8.7 9.7 8 10.563 8h.874c.863 0 1.563.7 1.563 1.563V12m0 0v1.5m0-1.5h-1.5M12 19.5V21m-3-3h6" />
  </svg>
);

const CertificateIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
);

const StatusIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const EditIcon = () => (
  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const SaveIcon = () => (
  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function DoctorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    specialization: '',
    qualification: '',
    experience: '',
    consultation_fee: '',
    availability_status: 'AVAILABLE',
    department_id: '',
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/doctors/me');
      setProfile(res.data);
      setForm({
        specialization: res.data.specialization || '',
        qualification: res.data.qualification || '',
        experience: res.data.experience ?? '',
        consultation_fee: res.data.consultation_fee ?? '',
        availability_status: res.data.availability_status || 'AVAILABLE',
        department_id: res.data.department_id ?? '',
      });
      setError('');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Convert empty strings to null for numeric fields to avoid 422
      const payload = {
        ...form,
        department_id: form.department_id === '' ? null : Number(form.department_id),
        experience: form.experience === '' ? null : Number(form.experience),
        consultation_fee: form.consultation_fee === '' ? null : Number(form.consultation_fee),
      };
      const res = await api.put('/doctors/me', payload);
      setProfile(res.data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center max-w-md w-full">
          <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 px-4 sm:px-0">
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Doctor Profile</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-0.5">
          Manage your professional information and availability
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 flex items-start gap-2">
          <svg className="h-4 w-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 flex items-start gap-2">
          <svg className="h-4 w-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {profile && !editing ? (
        /* View Mode */
        <div className="space-y-4">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                Dr. {profile.specialization || 'Specialist'}
              </h2>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.availability_status === 'AVAILABLE'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {profile.availability_status === 'AVAILABLE' ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="ml-auto flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm flex-shrink-0"
            >
              <EditIcon />
              Edit
            </button>
          </div>

          {/* Professional Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
              Professional Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 flex-shrink-0">
                  <StethoscopeIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Specialization</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{profile.specialization || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 flex-shrink-0">
                  <CertificateIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Qualification</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{profile.qualification || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 flex-shrink-0">
                  <ClockIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Experience</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{profile.experience ? `${profile.experience} years` : '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 flex-shrink-0">
                  <MoneyIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Consultation Fee</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{profile.consultation_fee ? `₹${profile.consultation_fee}` : '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Department Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
              Status & Department
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-green-50 flex-shrink-0">
                  <StatusIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Availability</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5 capitalize">{profile.availability_status?.toLowerCase()}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-green-50 flex-shrink-0">
                  <BuildingIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Department</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{profile.department_id ? `ID: ${profile.department_id}` : 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : editing && (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Professional Details Edit Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Professional Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <StethoscopeIcon />
                  </div>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 text-sm"
                    placeholder="e.g., Cardiologist"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CertificateIcon />
                  </div>
                  <input
                    type="text"
                    id="qualification"
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 text-sm"
                    placeholder="e.g., MBBS, MD"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (years)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClockIcon />
                  </div>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 text-sm"
                    placeholder="e.g., 5"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="consultation_fee" className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Fee (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MoneyIcon />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    id="consultation_fee"
                    name="consultation_fee"
                    value={form.consultation_fee}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 text-sm"
                    placeholder="e.g., 500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status & Department Edit Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Status & Department</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="availability_status" className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <StatusIcon />
                  </div>
                  <select
                    id="availability_status"
                    name="availability_status"
                    value={form.availability_status}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 bg-white appearance-none text-sm"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Department ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BuildingIcon />
                  </div>
                  <input
                    type="number"
                    id="department_id"
                    name="department_id"
                    value={form.department_id}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 text-sm"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
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
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}