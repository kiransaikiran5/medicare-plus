import { useEffect, useState } from "react";
import api from "../../services/api";

/* ===================== ICONS ===================== */

const SearchIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m0 0A7.5 7.5 0 105.2 5.2a7.5 7.5 0 0010.6 10.6z" />
  </svg>
);

const CalendarIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 8.25h18M4.5 5.25h15A1.5 1.5 0 0121 6.75v12A1.5 1.5 0 0119.5 20.25h-15A1.5 1.5 0 013 18.75v-12A1.5 1.5 0 014.5 5.25z" />
  </svg>
);

const ShieldIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75l7.5 3v5.25c0 4.65-3.15 8.85-7.5 10.05C7.65 20.85 4.5 16.65 4.5 12V6.75l7.5-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12l1.5 1.5 3.25-3.5" />
  </svg>
);

const EmptyIcon = ({ className = "h-8 w-8" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0a9 9 0 0118 0z" />
  </svg>
);

/* ===================== TOAST ===================== */

function Toast({ toast, onClose }) {
  if (!toast?.message) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed right-4 top-4 z-[9999] flex max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-xl ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black ${isSuccess ? "bg-emerald-100" : "bg-red-100"}`}>
        {isSuccess ? "✓" : "!"}
      </div>

      <p className="flex-1 text-sm font-bold">{toast.message}</p>

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

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);

  const [filters, setFilters] = useState({
    userId: "",
    startDate: "",
    endDate: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    userId: "",
    startDate: "",
    endDate: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const params = {
        limit,
        offset,
      };

      if (appliedFilters.userId) params.user_id = appliedFilters.userId;
      if (appliedFilters.startDate) params.start_date = appliedFilters.startDate;
      if (appliedFilters.endDate) params.end_date = appliedFilters.endDate;

      const res = await api.get("/audit/", { params });
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(typeof detail === "string" ? detail : "Failed to load audit logs", "error");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [offset, limit, appliedFilters]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 4000);

    return () => clearTimeout(timer);
  }, [toast]);

  const applyFilters = () => {
    setOffset(0);
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      userId: "",
      startDate: "",
      endDate: "",
    };

    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setOffset(0);
  };

  const handlePrev = () => {
    setOffset((current) => Math.max(0, current - limit));
  };

  const handleNext = () => {
    setOffset((current) => current + limit);
  };

  const formatIST = (dateStr) => {
    if (!dateStr) return "—";

    const date =
      String(dateStr).includes("+") || String(dateStr).includes("Z")
        ? new Date(dateStr)
        : new Date(`${dateStr}Z`);

    if (Number.isNaN(date.getTime())) return "—";

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

  const getActionStyle = (action = "") => {
    const upperAction = String(action).toUpperCase();

    if (upperAction.includes("POST")) {
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    }

    if (upperAction.includes("PUT") || upperAction.includes("PATCH")) {
      return "bg-blue-50 text-blue-700 ring-blue-100";
    }

    if (upperAction.includes("DELETE")) {
      return "bg-red-50 text-red-700 ring-red-100";
    }

    return "bg-slate-50 text-slate-700 ring-slate-100";
  };

  const totalVisible = logs.length;
  const canGoNext = logs.length === limit;

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-0">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            {/* <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700">
              <ShieldIcon className="h-4 w-4" />
              Module 20
            </div> */}

            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              Audit Logs
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Monitor system activity, security events, and user actions.
            </p>
          </div>

          <div className="w-fit rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">
            {totalVisible} visible logs
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <FeatureCard
          title="Activity Monitoring"
          text="Track API requests and system actions."
        />
        <FeatureCard
          title="Security Auditing"
          text="Review sensitive user and admin activity."
        />
        <FeatureCard
          title="User Activity History"
          text="Filter logs by user and time period."
        />
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-950">Filters</h2>
            <p className="text-xs font-medium text-slate-500">
              Search audit records using user ID and date range.
            </p>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200"
          >
            Clear
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1fr_140px_150px]">
          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-[0.1em] text-slate-500">
              User ID
            </label>

            <div className="relative">
              <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                value={filters.userId}
                onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))}
                placeholder="Filter by user"
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-[0.1em] text-slate-500">
              Start Date
            </label>

            <div className="relative">
              <CalendarIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-[0.1em] text-slate-500">
              End Date
            </label>

            <div className="relative">
              <CalendarIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-[0.1em] text-slate-500">
              Limit
            </label>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setOffset(0);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={applyFilters}
              className="w-full rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingBox />
      ) : logs.length === 0 ? (
        <EmptyBox />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <TableHead>ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Timestamp</TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="transition hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-black text-slate-950">
                      #{log.id}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-600">
                      {log.user_id ?? "N/A"}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${getActionStyle(log.action)}`}>
                        {log.action || "N/A"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-600">
                      {formatIST(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {logs.length > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={offset === 0}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Previous
          </button>

          <span className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-500 ring-1 ring-slate-200">
            Offset {offset}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

/* ===================== REUSABLE COMPONENTS ===================== */

function FeatureCard({ title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
      <p className="mt-1 text-xs font-medium text-slate-500">{text}</p>
    </div>
  );
}

function TableHead({ children }) {
  return (
    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500">
      {children}
    </th>
  );
}

function LoadingBox() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <svg
        className="mx-auto h-9 w-9 animate-spin text-indigo-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z"
        />
      </svg>

      <p className="mt-3 text-sm font-bold text-slate-500">Loading audit logs...</p>
    </div>
  );
}

function EmptyBox() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
        <EmptyIcon />
      </div>

      <h3 className="text-base font-black text-slate-950">No audit logs found</h3>
      <p className="mt-1 text-sm font-medium text-slate-500">
        Try changing the user ID or date range filters.
      </p>
    </div>
  );
}