import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

/* ===================== ICONS ===================== */

const BellIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <path
      d="M18 10C18 6.7 15.7 4.5 12 4.5C8.3 4.5 6 6.7 6 10V13.5L4.8 16.2C4.5 16.9 5 17.5 5.7 17.5H18.3C19 17.5 19.5 16.9 19.2 16.2L18 13.5V10Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M10 20C10.4 20.6 11.1 21 12 21C12.9 21 13.6 20.6 14 20"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12.5L9.5 17L19 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EmptyIcon = () => (
  <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none">
    <path
      d="M18 10C18 6.7 15.7 4.5 12 4.5C8.3 4.5 6 6.7 6 10V13.5L4.8 16.2C4.5 16.9 5 17.5 5.7 17.5H18.3C19 17.5 19.5 16.9 19.2 16.2L18 13.5V10Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M10 20C10.4 20.6 11.1 21 12 21C12.9 21 13.6 20.6 14 20"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

/* ===================== TOAST ===================== */

function Toast({ message, type, onClose }) {
  if (!message) return null;

  const bg =
    type === "success"
      ? "bg-green-50 border-green-200 text-green-800"
      : "bg-red-50 border-red-200 text-red-800";

  const Icon =
    type === "success" ? (
      <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ) : (
      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] max-w-sm w-full p-4 border rounded-xl shadow-lg flex items-start gap-3 ${bg} animate-slide-in`}
    >
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

/* ===================== COMPONENT ===================== */

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const dropdownRef = useRef(null);

  // Auto‑dismiss toast after 4s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications/my");
      const list = Array.isArray(res.data) ? res.data : [];

      const sorted = [...list].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      setNotifications(sorted.slice(0, 6));
      setUnreadCount(sorted.filter((item) => !item.is_read).length);
    } catch (err) {
      setNotifications([]);
      setUnreadCount(0);
      setToast({ message: "Failed to load notifications", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setOpen((prev) => !prev);
    if (!open) {
      fetchNotifications();
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setToast({ message: "Marked as read", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to mark as read", type: "error" });
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const dateStr = String(dateValue);
    const date = dateStr.includes("Z") || dateStr.includes("+")
      ? new Date(dateStr)
      : new Date(dateStr + "Z");
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const getTypeStyle = (type) => {
    const value = String(type || "GENERAL").toUpperCase();
    if (value === "APPOINTMENT") return "bg-blue-50 text-blue-700";
    if (value === "ALERT") return "bg-red-50 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <>
      {/* Toast notification */}
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      <div className="relative" ref={dropdownRef}>
        {/* Bell button */}
        <button
          type="button"
          onClick={toggleDropdown}
          className={`
            relative flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm transition
            ${
              open
                ? "border-blue-600 bg-blue-600 text-white shadow-blue-100"
                : "border-blue-100 bg-blue-50 text-blue-700 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md"
            }
          `}
          aria-label="Open notifications"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black leading-none text-white ring-2 ring-white">
              {displayCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-14 z-[9999] w-[340px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80">
            {/* ... rest of dropdown exactly as before ... */}
            <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-950">Notifications</h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {unreadCount > 0
                      ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`
                      : "No unread updates"}
                  </p>
                </div>
                <Link
                  to="/notifications"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-700"
                >
                  View all
                </Link>
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {loading ? (
                <div className="space-y-3 p-4">
                  <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                    <EmptyIcon />
                  </div>
                  <h4 className="mt-4 text-sm font-black text-slate-900">No notifications</h4>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    New updates will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((item) => {
                    const unread = !item.is_read;
                    return (
                      <div
                        key={item.id}
                        className={`px-4 py-3 transition hover:bg-slate-50 ${
                          unread ? "bg-blue-50/50" : "bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                              unread ? "bg-blue-600" : "bg-slate-300"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-black ${getTypeStyle(
                                  item.type
                                )}`}
                              >
                                {item.type || "GENERAL"}
                              </span>
                              <span className="shrink-0 text-[10px] font-bold text-slate-400">
                                {formatDate(item.created_at)}
                              </span>
                            </div>
                            <p
                              className={`mt-2 line-clamp-2 text-sm leading-5 ${
                                unread
                                  ? "font-black text-slate-950"
                                  : "font-semibold text-slate-600"
                              }`}
                            >
                              {item.message || "No message available"}
                            </p>
                            {unread && (
                              <button
                                type="button"
                                onClick={() => markAsRead(item.id)}
                                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-600 hover:text-white"
                              >
                                <CheckIcon />
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                <Link
                  to="/notifications"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-slate-800"
                >
                  Open Notification Center
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}