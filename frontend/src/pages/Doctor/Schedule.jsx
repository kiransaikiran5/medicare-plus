import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ===== Inline SVG Icons ===== */
const ClockIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '17:00',
    slot_duration_minutes: 30,
    max_patients_per_slot: 1,
  });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Auto‑dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchSchedules = async () => {
    try {
      const res = await api.get('/doctor-schedule/my');
      setSchedules(res.data);
    } catch (err) {
      setToast({ message: 'Failed to load schedules', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const openAddForm = () => {
    setEditId(null);
    setForm({
      day_of_week: 'Monday',
      start_time: '09:00',
      end_time: '17:00',
      slot_duration_minutes: 30,
      max_patients_per_slot: 1,
    });
    setShowForm(true);
  };

  const openEditForm = (sched) => {
    setEditId(sched.id);
    setForm({
      day_of_week: sched.day_of_week,
      start_time: sched.start_time,
      end_time: sched.end_time,
      slot_duration_minutes: sched.slot_duration_minutes,
      max_patients_per_slot: sched.max_patients_per_slot,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/doctor-schedule/${editId}`, {
          start_time: form.start_time,
          end_time: form.end_time,
          slot_duration_minutes: form.slot_duration_minutes,
          max_patients_per_slot: form.max_patients_per_slot,
        });
        setToast({ message: 'Schedule updated', type: 'success' });
      } else {
        await api.post('/doctor-schedule/', {
          day_of_week: form.day_of_week,
          start_time: form.start_time,
          end_time: form.end_time,
          slot_duration_minutes: form.slot_duration_minutes,
          max_patients_per_slot: form.max_patients_per_slot,
        });
        setToast({ message: 'Schedule added', type: 'success' });
      }
      setShowForm(false);
      setEditId(null);
      fetchSchedules();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Operation failed', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/doctor-schedule/${deleteId}`);
      setToast({ message: 'Schedule deleted', type: 'success' });
      setDeleteId(null);
      fetchSchedules();
    } catch (err) {
      setToast({ message: 'Delete failed', type: 'error' });
      setDeleteId(null);
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
          <p className="text-gray-500 text-sm">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Schedule</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this schedule? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
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

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editId ? 'Edit Schedule' : 'New Schedule'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                  <select
                    name="day_of_week"
                    value={form.day_of_week}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    name="start_time"
                    value={form.start_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (min)</label>
                  <input
                    type="number"
                    name="slot_duration_minutes"
                    value={form.slot_duration_minutes}
                    onChange={handleChange}
                    min="10"
                    max="120"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Patients/Slot</label>
                  <input
                    type="number"
                    name="max_patients_per_slot"
                    value={form.max_patients_per_slot}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
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
                  {editId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Weekly Schedule</h1>
          <p className="text-sm text-gray-500 mt-0.5">Set your availability for each day</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center self-start sm:self-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon />
          Add Schedule
        </button>
      </div>

      {/* Weekly Schedule Cards */}
      {schedules.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <CalendarIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No schedules yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Add your weekly availability so patients can book appointments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DAYS.map(day => {
            const sched = schedules.find(s => s.day_of_week === day);
            if (sched) {
              return (
                <div key={sched.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <CalendarIcon />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{day}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                          <ClockIcon className="h-4 w-4" />
                          <span>{sched.start_time} – {sched.end_time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-4 flex flex-wrap gap-3">
                    <span>🕒 {sched.slot_duration_minutes} min slots</span>
                    <span>👤 max {sched.max_patients_per_slot} per slot</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(sched)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      <EditIcon />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(sched.id)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      <DeleteIcon />
                      Delete
                    </button>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={day} className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-50">
                      <CalendarIcon />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-400">{day}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">No schedule set</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setForm(prev => ({ ...prev, day_of_week: day }));
                      openAddForm();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add
                  </button>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}