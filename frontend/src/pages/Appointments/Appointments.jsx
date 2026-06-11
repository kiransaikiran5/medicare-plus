import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

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

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Reschedule modal state
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleSlot, setRescheduleSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch available slots when reschedule date changes
  useEffect(() => {
    if (!rescheduleAppt || !rescheduleDate) {
      setRescheduleSlots([]);
      setRescheduleSlot(null);
      return;
    }

    setSlotsLoading(true);
    api
      .get(`/doctors/${rescheduleAppt.doctor_id}/slots`, {
        params: { dt: rescheduleDate },
      })
      .then((res) => {
        setRescheduleSlots(res.data || []);
        setRescheduleSlot(null);
      })
      .catch(() => setToast({ message: 'Could not load time slots', type: 'error' }))
      .finally(() => setSlotsLoading(false));
  }, [rescheduleDate, rescheduleAppt]);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/my');
      setAppointments(res.data);
    } catch (err) {
      setToast({ message: 'Failed to load appointments', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    setCancelId(id);
    setShowCancelConfirm(true);
  };

  const confirmCancel = async () => {
    if (!cancelId) return;
    try {
      await api.put(`/appointments/${cancelId}/cancel`);
      setToast({ message: 'Appointment cancelled', type: 'success' });
      fetchAppointments();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Cancel failed', type: 'error' });
    } finally {
      setShowCancelConfirm(false);
      setCancelId(null);
    }
  };

  const openRescheduleModal = (appt) => {
    setRescheduleAppt(appt);
    setRescheduleDate('');
    setRescheduleSlots([]);
    setRescheduleSlot(null);
  };

  const handleRescheduleConfirm = async () => {
    if (!rescheduleSlot) {
      setToast({ message: 'Please select a time slot', type: 'error' });
      return;
    }
    try {
      await api.put(`/appointments/${rescheduleAppt.id}/reschedule`, {
        new_time: rescheduleSlot,   // UTC string from slots API
      });
      setToast({ message: 'Appointment rescheduled', type: 'success' });
      setRescheduleAppt(null);
      fetchAppointments();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Reschedule failed', type: 'error' });
    }
  };

  // ---------- TIME HELPERS ----------
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

  // Format a UTC slot string (from the slots API) to IST time
  const formatSlotTime = (isoString) => {
    const date = new Date(isoString);   // already UTC, browser will parse correctly
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  };

  const activeAppts = appointments.filter(a => a.status !== 'CANCELLED' && a.status !== 'COMPLETED');
  const pastAppts = appointments.filter(a => a.status === 'CANCELLED' || a.status === 'COMPLETED');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 sm:px-0">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Appointment</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCancelConfirm(false); setCancelId(null); }}
                className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal (slot‑aware) */}
      {rescheduleAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reschedule Appointment</h3>
            <p className="text-sm text-gray-600 mb-2">
              Doctor ID: {rescheduleAppt.doctor_id} | Current time:{' '}
              {formatIST(rescheduleAppt.appointment_time, true)}
            </p>

            {/* Date picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              />
            </div>

            {/* Slots */}
            {rescheduleDate && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Time Slots
                </label>
                {slotsLoading ? (
                  <p className="text-gray-500 text-sm">Loading slots...</p>
                ) : rescheduleSlots.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No available slots for this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {rescheduleSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setRescheduleSlot(slot)}
                        className={`p-2 rounded border text-sm font-medium transition ${
                          rescheduleSlot === slot
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white border-gray-300 hover:bg-blue-50'
                        }`}
                      >
                        {/* FIXED: Display in IST, not local time */}
                        {formatSlotTime(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRescheduleAppt(null)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleConfirm}
                disabled={!rescheduleSlot}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your upcoming and past appointments</p>
        </div>
        <Link
          to="/book-appointment"
          className="flex items-center self-start sm:self-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon />
          Book New
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <CalendarIcon />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No appointments found</h3>
          <p className="text-sm text-gray-500">You haven't booked any appointments yet.</p>
        </div>
      ) : (
        <>
          {activeAppts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAppts.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    onCancel={() => handleCancel(appt.id)}
                    onReschedule={() => openRescheduleModal(appt)}
                  />
                ))}
              </div>
            </div>
          )}
          {pastAppts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Past Appointments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastAppts.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    onCancel={null}
                    onReschedule={null}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ===== Appointment Card ===== */
function AppointmentCard({ appointment, onCancel, onReschedule }) {
  const statusColors = {
    CONFIRMED: 'bg-green-50 text-green-700',
    PENDING: 'bg-yellow-50 text-yellow-700',
    CANCELLED: 'bg-red-50 text-red-700',
    COMPLETED: 'bg-blue-50 text-blue-700',
  };
  const statusColor = statusColors[appointment.status] || 'bg-gray-50 text-gray-700';

  // Parse the ISO string (could be naive UTC or already with offset) and display in IST
  const parseToIST = (dateStr) => {
    if (!dateStr) return new Date();
    if (dateStr.includes('+') || dateStr.includes('Z')) {
      return new Date(dateStr);
    }
    // Treat naive as UTC
    return new Date(dateStr + 'Z');
  };

  const apptDate = parseToIST(appointment.appointment_time);

  const formattedDate = apptDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
  const formattedTime = apptDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <CalendarIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <ClockIcon className="h-4 w-4" />
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {appointment.status}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-600 mb-3">
        <p><span className="text-gray-500">Doctor ID:</span> {appointment.doctor_id}</p>
        <p><span className="text-gray-500">Department ID:</span> {appointment.department_id || 'N/A'}</p>
        <p><span className="text-gray-500">Reason:</span> {appointment.reason || 'N/A'}</p>
      </div>

      {onCancel && onReschedule && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={onReschedule}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Reschedule
          </button>
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}