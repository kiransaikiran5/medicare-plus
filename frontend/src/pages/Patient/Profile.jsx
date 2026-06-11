import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/* ===== Inline SVG Icons (unchanged) ===== */
const UserIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const AddressIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const GenderIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);

const AgeIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BloodIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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

export default function PatientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    gender: '',
    age: '',
    blood_group: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/patients/me');
      setProfile(res.data);
      setForm({
        full_name: res.data.full_name || '',
        gender: res.data.gender || '',
        age: res.data.age || '',
        blood_group: res.data.blood_group || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
      });
    } catch (err) {
      console.error('Failed to load profile');
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
      const res = await api.put('/patients/me', form);
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

  return (
    <div className="max-w-3xl mx-auto py-4 px-4 sm:px-0">
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-0.5">
          Manage your personal and medical information
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

      {!editing ? (
        /* View Mode */
        <div className="space-y-4">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold flex-shrink-0">
              {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {profile?.full_name || 'Your Name'}
              </h2>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium capitalize">
                {user?.role?.toLowerCase()}
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

          {/* Personal Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 flex-shrink-0">
                  <UserIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Full Name</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{profile?.full_name || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 flex-shrink-0">
                  <PhoneIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Phone</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{profile?.phone || '—'}</p>
                </div>
              </div>
              <div className="col-span-1 sm:col-span-2 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 flex-shrink-0">
                  <AddressIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Address</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{profile?.address || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
              Medical Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-green-50 flex-shrink-0">
                  <GenderIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Gender</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{profile?.gender || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-green-50 flex-shrink-0">
                  <AgeIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Age</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{profile?.age || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-green-50 flex-shrink-0">
                  <BloodIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Blood Group</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{profile?.blood_group || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Details Edit Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 text-sm"
                    placeholder="Enter full name"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon />
                  </div>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 text-sm"
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute top-2.5 left-0 pl-3 flex items-start pointer-events-none">
                    <AddressIcon />
                  </div>
                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows="2"
                    className="pl-9 pr-3 py-2 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 text-sm resize-none"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information Edit Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Medical Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GenderIcon />
                  </div>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 bg-white appearance-none text-sm"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AgeIcon />
                  </div>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 text-sm"
                    placeholder="Age"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="blood_group" className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BloodIcon />
                  </div>
                  <select
                    id="blood_group"
                    name="blood_group"
                    value={form.blood_group}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2.5 w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 bg-white appearance-none text-sm"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
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