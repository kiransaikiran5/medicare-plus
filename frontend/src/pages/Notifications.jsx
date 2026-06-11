import { useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";

/* ===================== ICONS ===================== */

const BellIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 10C18 6.7 15.7 4.5 12 4.5C8.3 4.5 6 6.7 6 10V13.5L4.8 16.2C4.5 16.9 5 17.5 5.7 17.5H18.3C19 17.5 19.5 16.9 19.2 16.2L18 13.5V10Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 20C10.4 20.6 11.1 21 12 21C12.9 21 13.6 20.6 14 20"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 4V7M17 4V7M5.5 6H18.5C19.3 6 20 6.7 20 7.5V18.5C20 19.3 19.3 20 18.5 20H5.5C4.7 20 4 19.3 4 18.5V7.5C4 6.7 4.7 6 5.5 6Z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 10H20" />
  </svg>
);

const AlertIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8V12M12 16H12.01M21 12C21 17 17 21 12 21C7 21 3 17 3 12C3 7 7 3 12 3C17 3 21 7 21 12Z"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 11.5V16M12 8H12.01M21 12C21 17 17 21 12 21C7 21 3 17 3 12C3 7 7 3 12 3C17 3 21 7 21 12Z"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 18C14.9 18 18 14.9 18 11C18 7.1 14.9 4 11 4C7.1 4 4 7.1 4 11C4 14.9 7.1 18 11 18Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 16.5L20 20"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 12.5L9.5 17L19 7"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 6L18 18M18 6L6 18"
    />
  </svg>
);

const EmptyIcon = () => (
  <svg
    className="h-12 w-12"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 10C18 6.7 15.7 4.5 12 4.5C8.3 4.5 6 6.7 6 10V13.5L4.8 16.2C4.5 16.9 5 17.5 5.7 17.5H18.3C19 17.5 19.5 16.9 19.2 16.2L18 13.5V10Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 20C10.4 20.6 11.1 21 12 21C12.9 21 13.6 20.6 14 20"
    />
  </svg>
);

/* ===================== CONFIG ===================== */

const typeConfig = {
  APPOINTMENT: {
    label: "Appointment",
    icon: <CalendarIcon />,
    box: "bg-blue-50 text-blue-600",
    badge: "bg-blue-50 text-blue-700",
  },
  ALERT: {
    label: "Alert",
    icon: <AlertIcon />,
    box: "bg-red-50 text-red-600",
    badge: "bg-red-50 text-red-700",
  },
  GENERAL: {
    label: "General",
    icon: <InfoIcon />,
    box: "bg-slate-100 text-slate-600",
    badge: "bg-slate-100 text-slate-700",
  },
};

/* ===================== TOAST ===================== */

function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="fixed right-4 top-4 z-[9999] w-[calc(100%-2rem)] max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl ${
          isSuccess
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isSuccess ? "bg-emerald-100" : "bg-red-100"
          }`}
        >
          {isSuccess ? <CheckIcon /> : <AlertIcon />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">
            {isSuccess ? "Success" : "Error"}
          </p>
          <p className="mt-0.5 text-sm font-semibold leading-5">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className={`rounded-lg p-1 ${
            isSuccess ? "hover:bg-emerald-100" : "hover:bg-red-100"
          }`}
          aria-label="Close toast"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

/* ===================== PAGE ===================== */

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [updatingAll, setUpdatingAll] = useState(false);

  const toastTimerRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const res = await api.get("/notifications/my");
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("error", "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      setUpdatingId(id);

      await api.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        )
      );

      showToast("success", "Notification marked as read");
    } catch (err) {
      showToast("error", "Failed to mark notification as read");
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((item) => !item.is_read);

    if (unread.length === 0) {
      showToast("success", "No unread notifications");
      return;
    }

    try {
      setUpdatingAll(true);

      await Promise.all(
        unread.map((item) => api.put(`/notifications/${item.id}/read`))
      );

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true }))
      );

      showToast("success", "All notifications marked as read");
    } catch (err) {
      showToast("error", "Failed to update notifications");
    } finally {
      setUpdatingAll(false);
    }
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;

    const date =
      dateStr.includes("+") || dateStr.includes("Z")
        ? new Date(dateStr)
        : new Date(`${dateStr}Z`);

    if (Number.isNaN(date.getTime())) return null;

    return date;
  };

  const formatIST = (dateStr) => {
    const date = parseDate(dateStr);

    if (!date) return "N/A";

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const getRelativeTime = (dateStr) => {
    const date = parseDate(dateStr);

    if (!date) return "N/A";

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;

    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.is_read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return notifications.filter((item) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && !item.is_read) ||
        (filter === "read" && item.is_read);

      const matchesSearch =
        !keyword ||
        String(item.message || "").toLowerCase().includes(keyword) ||
        String(item.type || "").toLowerCase().includes(keyword);

      return matchesFilter && matchesSearch;
    });
  }, [notifications, filter, search]);

  const sortedNotifications = useMemo(() => {
    return [...filteredNotifications].sort((a, b) => {
      const dateA = parseDate(a.created_at)?.getTime() || 0;
      const dateB = parseDate(b.created_at)?.getTime() || 0;

      return dateB - dateA;
    });
  }, [filteredNotifications]);

  const tabs = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    {
      key: "read",
      label: "Read",
      count: notifications.length - unreadCount,
    },
  ];

  if (loading) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />

        <div className="space-y-5">
          <div className="h-28 animate-pulse rounded-3xl bg-slate-100" />
          <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="h-56 animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-56 animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-56 animate-pulse rounded-3xl bg-slate-100" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="space-y-5">
        {/* Header */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <BellIcon />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">
                  Notifications
                </h1>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${
                        unreadCount > 1 ? "s" : ""
                      }`
                    : "You are all caught up"}
                </p>
              </div>
            </div>

            <button
              onClick={markAllAsRead}
              disabled={updatingAll}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <CheckIcon />
              {updatingAll ? "Updating..." : "Mark all read"}
            </button>
          </div>
        </section>

        {/* Controls */}
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => {
                const active = filter === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        active ? "bg-white/20" : "bg-white text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500 md:w-72">
              <SearchIcon />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search..."
              />
            </div>
          </div>
        </section>

        {/* Cards Grid */}
        {sortedNotifications.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
              <EmptyIcon />
            </div>

            <h3 className="mt-4 text-lg font-black text-slate-950">
              No notifications found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
              Try clearing your search or changing the selected tab.
            </p>

            <button
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
              className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Clear Filters
            </button>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedNotifications.map((item) => {
              const type = String(item.type || "GENERAL").toUpperCase();
              const config = typeConfig[type] || typeConfig.GENERAL;
              const unread = !item.is_read;

              return (
                <article
                  key={item.id}
                  className={`flex min-h-[230px] flex-col rounded-3xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
                    unread ? "border-blue-200 bg-blue-50/30" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.box}`}
                    >
                      {config.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${config.badge}`}
                        >
                          {config.label}
                        </span>

                        {unread && (
                          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                            New
                          </span>
                        )}
                      </div>

                      <p
                        className="mt-2 text-xs font-bold text-slate-400"
                        title={formatIST(item.created_at)}
                      >
                        {getRelativeTime(item.created_at)}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`mt-4 flex-1 text-sm leading-6 ${
                      unread
                        ? "font-black text-slate-950"
                        : "font-semibold text-slate-600"
                    }`}
                  >
                    {item.message || "No message available"}
                  </p>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-xs font-bold text-slate-400">
                      {formatIST(item.created_at)}
                    </p>

                    {unread && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        disabled={updatingId === item.id}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs font-black text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:bg-blue-100"
                      >
                        <CheckIcon />
                        {updatingId === item.id ? "Updating..." : "Mark read"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </>
  );
}