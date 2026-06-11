import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

/* ===================== DATE TIME FIX ===================== */

const parseAppointmentDate = (dateStr) => {
  if (!dateStr) return null;

  const value = String(dateStr);

  if (value.includes("Z") || value.includes("+")) {
    return new Date(value);
  }

  return new Date(value.replace(" ", "T"));
};

const formatAppointmentDate = (dateStr) => {
  const date = parseAppointmentDate(dateStr);
  if (!date || Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatAppointmentTime = (dateStr) => {
  const date = parseAppointmentDate(dateStr);
  if (!date || Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatAppointmentDateTime = (dateStr) => {
  return `${formatAppointmentDate(dateStr)} ${formatAppointmentTime(dateStr)}`;
};

/* ===================== ICONS ===================== */

const CalendarIcon = ({ className = "h-5 w-5 text-gray-400" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
    />
  </svg>
);

const ClockIcon = ({ className = "h-5 w-5 text-gray-400" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const PlusIcon = ({ className = "mr-2 h-5 w-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

const CloseIcon = ({ className = "mr-2 h-5 w-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const SaveIcon = ({ className = "mr-2 h-5 w-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/* ===================== TOAST ===================== */

function Toast({ message, type, onClose }) {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed right-4 top-4 z-[9999] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-xl ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
          isSuccess ? "bg-emerald-100" : "bg-red-100"
        }`}
      >
        {isSuccess ? "✓" : "!"}
      </div>

      <p className="flex-1 text-sm font-bold">{message}</p>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg px-2 text-sm font-black text-slate-400 hover:bg-white hover:text-slate-700"
      >
        ×
      </button>
    </div>
  );
}

/* ===================== PAGE ===================== */

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [cancelId, setCancelId] = useState(null);

  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleSlot, setRescheduleSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const res = await api.get("/appointments/my");
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("Failed to load appointments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 4000);

    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!rescheduleAppt || !rescheduleDate) {
      setRescheduleSlots([]);
      setRescheduleSlot(null);
      return;
    }

    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);

        const res = await api.get(`/doctors/${rescheduleAppt.doctor_id}/slots`, {
          params: {
            dt: rescheduleDate,
          },
        });

        setRescheduleSlots(Array.isArray(res.data) ? res.data : []);
        setRescheduleSlot(null);
      } catch (err) {
        showToast("Could not load time slots", "error");
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [rescheduleDate, rescheduleAppt]);

  const openCancelModal = (id) => {
    setCancelId(id);
  };

  const confirmCancel = async () => {
    if (!cancelId) return;

    try {
      await api.put(`/appointments/${cancelId}/cancel`);
      showToast("Appointment cancelled", "success");
      setCancelId(null);
      fetchAppointments();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(
        typeof detail === "string" ? detail : "Cancel failed",
        "error"
      );
      setCancelId(null);
    }
  };

  const openRescheduleModal = (appt) => {
    setRescheduleAppt(appt);
    setRescheduleDate("");
    setRescheduleSlots([]);
    setRescheduleSlot(null);
  };

  const closeRescheduleModal = () => {
    setRescheduleAppt(null);
    setRescheduleDate("");
    setRescheduleSlots([]);
    setRescheduleSlot(null);
  };

  const handleRescheduleConfirm = async () => {
    if (!rescheduleAppt) return;

    if (!rescheduleSlot) {
      showToast("Please select a time slot", "error");
      return;
    }

    try {
      await api.put(`/appointments/${rescheduleAppt.id}/reschedule`, {
        new_time: rescheduleSlot,
      });

      showToast("Appointment rescheduled", "success");
      closeRescheduleModal();
      fetchAppointments();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(
        typeof detail === "string" ? detail : "Reschedule failed",
        "error"
      );
    }
  };

  const upcomingAppointments = appointments.filter(
    (appt) => appt.status !== "CANCELLED" && appt.status !== "COMPLETED"
  );

  const pastAppointments = appointments.filter(
    (appt) => appt.status === "CANCELLED" || appt.status === "COMPLETED"
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="h-10 w-10 animate-spin text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />

            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z"
            />
          </svg>

          <p className="text-sm font-medium text-gray-500">
            Loading appointments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-0">
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Cancel Confirmation Modal */}
      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h3 className="mb-2 text-lg font-black text-gray-900">
                Cancel Appointment
              </h3>

              <p className="text-sm font-medium text-gray-500">
                Are you sure you want to cancel this appointment? This action
                cannot be undone.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setCancelId(null)}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
              >
                Keep Appointment
              </button>

              <button
                type="button"
                onClick={confirmCancel}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-black text-gray-900">
              Reschedule Appointment
            </h2>

            <div className="mb-4 rounded-2xl bg-gray-50 p-4 text-sm font-medium text-gray-600">
              <p>
                <span className="font-black text-gray-800">Doctor ID:</span>{" "}
                {rescheduleAppt.doctor_id}
              </p>

              <p className="mt-1">
                <span className="font-black text-gray-800">Current:</span>{" "}
                {formatAppointmentDateTime(rescheduleAppt.appointment_time)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-700">
                  New Date
                </label>

                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {rescheduleDate && (
                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Available Slots
                  </label>

                  {slotsLoading ? (
                    <p className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm font-medium text-gray-500">
                      <svg
                        className="h-4 w-4 animate-spin text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z"
                        />
                      </svg>
                      Loading slots...
                    </p>
                  ) : rescheduleSlots.length === 0 ? (
                    <p className="rounded-xl bg-gray-50 p-3 text-sm font-medium text-gray-500">
                      No available slots for this date.
                    </p>
                  ) : (
                    <div className="grid max-h-44 grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-gray-100 p-2">
                      {rescheduleSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setRescheduleSlot(slot)}
                          className={`rounded-xl border p-2 text-sm font-bold transition ${
                            rescheduleSlot === slot
                              ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                              : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          {formatAppointmentTime(slot)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeRescheduleModal}
                  className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
                >
                  <CloseIcon />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleRescheduleConfirm}
                  disabled={!rescheduleSlot}
                  className="flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SaveIcon />
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            My Appointments
          </h1>

          <p className="mt-0.5 text-sm font-medium text-gray-500">
            Manage your upcoming and past appointments
          </p>
        </div>

        <Link
          to="/book-appointment"
          className="flex self-start rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 sm:self-center"
        >
          <PlusIcon />
          Book New
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <CalendarIcon className="h-8 w-8 text-blue-500" />
          </div>

          <h3 className="mb-1 text-lg font-black text-gray-900">
            No appointments found
          </h3>

          <p className="text-sm font-medium text-gray-500">
            You have not booked any appointments yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcomingAppointments.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-black text-gray-800">
                Upcoming Appointments
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {upcomingAppointments.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    type="upcoming"
                    onCancel={() => openCancelModal(appt.id)}
                    onReschedule={() => openRescheduleModal(appt)}
                  />
                ))}
              </div>
            </div>
          )}

          {pastAppointments.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-black text-gray-800">
                Past Appointments
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pastAppointments.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    type="past"
                    onCancel={null}
                    onReschedule={null}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ===================== APPOINTMENT CARD ===================== */

function AppointmentCard({ appointment, type, onCancel, onReschedule }) {
  const statusColors = {
    CONFIRMED: "bg-green-50 text-green-700",
    PENDING: "bg-yellow-50 text-yellow-700",
    CANCELLED: "bg-red-50 text-red-700",
    COMPLETED: "bg-blue-50 text-blue-700",
  };

  const statusColor =
    statusColors[appointment.status] || "bg-gray-50 text-gray-700";

  const muted = type === "past";

  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition ${
        muted ? "" : "hover:shadow-md"
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${muted ? "bg-gray-50" : "bg-blue-50"}`}>
            <CalendarIcon />
          </div>

          <div>
            <p
              className={`text-sm font-black ${
                muted ? "text-gray-500" : "text-gray-900"
              }`}
            >
              {formatAppointmentDate(appointment.appointment_time)}
            </p>

            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                muted ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <ClockIcon className="h-4 w-4 text-gray-400" />
              <span>{formatAppointmentTime(appointment.appointment_time)}</span>
            </div>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-black ${statusColor}`}
        >
          {appointment.status}
        </span>
      </div>

      <div
        className={`space-y-1 text-sm font-medium ${
          muted ? "text-gray-500" : "text-gray-600"
        }`}
      >
        <p>
          <span className="font-bold">Doctor ID:</span>{" "}
          {appointment.doctor_id}
        </p>

        <p>
          <span className="font-bold">Department ID:</span>{" "}
          {appointment.department_id || "N/A"}
        </p>

        <p>
          <span className="font-bold">Reason:</span>{" "}
          {appointment.reason || "N/A"}
        </p>
      </div>

      {onCancel && onReschedule && (
        <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onReschedule}
            className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
          >
            Reschedule
          </button>
        </div>
      )}
    </div>
  );
}