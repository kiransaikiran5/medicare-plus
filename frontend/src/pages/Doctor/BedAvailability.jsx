import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

/* ===================== ICONS ===================== */

const SvgIcon = ({ children, className = "h-5 w-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const HospitalIcon = ({ className = "h-6 w-6" }) => (
  <SvgIcon className={className}>
    <path d="M4 21H20" />
    <path d="M6 21V5.8C6 4.8 6.8 4 7.8 4H16.2C17.2 4 18 4.8 18 5.8V21" />
    <path d="M9 8H10M14 8H15M9 11.5H10M14 11.5H15M9 15H10M14 15H15" />
    <path d="M10 21V18C10 17.4 10.4 17 11 17H13C13.6 17 14 17.4 14 18V21" />
  </SvgIcon>
);

const BedIcon = ({ className = "h-5 w-5" }) => (
  <SvgIcon className={className}>
    <path d="M4 12V7.5C4 6.7 4.7 6 5.5 6H9.5C10.3 6 11 6.7 11 7.5V12" />
    <path d="M4 12H20V18" />
    <path d="M20 12V10C20 8.9 19.1 8 18 8H13V12" />
    <path d="M4 18V20M20 18V20" />
  </SvgIcon>
);

const RefreshIcon = ({ className = "h-5 w-5" }) => (
  <SvgIcon className={className}>
    <path d="M20 6V11H15" />
    <path d="M4 18V13H9" />
    <path d="M6.2 9A7 7 0 0 1 18.4 7.2L20 11" />
    <path d="M17.8 15A7 7 0 0 1 5.6 16.8L4 13" />
  </SvgIcon>
);

const EmptyIcon = ({ className = "h-8 w-8" }) => (
  <SvgIcon className={className}>
    <path d="M7 4H17C18.1 4 19 4.9 19 6V20H5V6C5 4.9 5.9 4 7 4Z" />
    <path d="M9 9H15M9 13H15M9 17H12" />
  </SvgIcon>
);

/* ===================== TOAST ===================== */

function Toast({ toast, onClose }) {
  if (!toast?.message) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-lg ${
        isSuccess ? "border-emerald-200" : "border-rose-200"
      }`}
    >
      <div
        className={`mt-1 h-2.5 w-2.5 rounded-full ${
          isSuccess ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      <p className="flex-1 text-sm font-semibold text-slate-700">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg px-2 text-sm font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-700"
      >
        ×
      </button>
    </div>
  );
}

/* ===================== PAGE ===================== */

export default function BedAvailability() {
  const [beds, setBeds] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchData = async (showSuccess = false) => {
    try {
      setLoading(true);
      const [bedsRes, wardsRes] = await Promise.all([
        api.get("/beds/"),
        api.get("/wards/"),
      ]);
      setBeds(Array.isArray(bedsRes.data) ? bedsRes.data : []);
      setWards(Array.isArray(wardsRes.data) ? wardsRes.data : []);
      if (showSuccess) {
        showToast("Bed availability updated", "success");
      }
    } catch (err) {
      showToast("Failed to load bed availability", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(() => {
    const total = beds.length;
    const available = beds.filter(
      (bed) => String(bed.status).toUpperCase() === "AVAILABLE"
    ).length;
    const occupied = beds.filter(
      (bed) => String(bed.status).toUpperCase() === "OCCUPIED"
    ).length;
    const other = total - available - occupied;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, available, occupied, other, occupancyRate };
  }, [beds]);

  const filteredWards = useMemo(() => {
    if (statusFilter === "ALL") return wards;
    return wards.filter((ward) => {
      const wardBeds = beds.filter(
        (bed) => String(bed.ward_id) === String(ward.id)
      );
      return wardBeds.some(
        (bed) => String(bed.status).toUpperCase() === statusFilter
      );
    });
  }, [wards, beds, statusFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl px-10 py-8 text-center shadow-2xl">
          <svg
            className="mx-auto h-10 w-10 animate-spin text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-80"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
            />
          </svg>
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading bed availability...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-0">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Glass Header */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 p-6 text-white shadow-2xl sm:p-8">
        {/* Decorative background circles */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <HospitalIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Bed Availability
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Real‑time ward capacity overview
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchData(true)}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
          >
            <RefreshIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Quick Stat Cards */}
        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Available", value: stats.available, icon: "●", color: "emerald" },
            { label: "Occupied", value: stats.occupied, icon: "●", color: "rose" },
            { label: "Other", value: stats.other, icon: "●", color: "amber" },
            { label: "Total", value: stats.total, icon: "●", color: "white" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl bg-white/10 p-4 backdrop-blur transition hover:bg-white/15"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-slate-300">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-bold">{item.value}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-white/20">
                  <div
                    className={`h-full rounded-full ${
                      item.color === "emerald"
                        ? "bg-emerald-400"
                        : item.color === "rose"
                        ? "bg-rose-400"
                        : item.color === "amber"
                        ? "bg-amber-400"
                        : "bg-white"
                    }`}
                    style={{
                      width: `${
                        (item.value / Math.max(stats.total, 1)) * 100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs text-slate-400">
                  {stats.total > 0
                    ? Math.round((item.value / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Occupancy Bar */}
        <div className="relative mt-6">
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>Occupancy level</span>
            <span>{stats.occupancyRate}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400 transition-all duration-700"
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        {["ALL", "AVAILABLE", "OCCUPIED", "MAINTENANCE"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              statusFilter === status
                ? "bg-slate-800 text-white shadow-lg shadow-slate-200"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"
            }`}
          >
            {status === "ALL" ? "All Beds" : status}
          </button>
        ))}
      </div>

      {/* Wards */}
      {filteredWards.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <EmptyIcon />
          </div>
          <h3 className="mt-5 text-lg font-bold text-slate-900">
            No wards found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Try changing the selected filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredWards.map((ward) => {
            const wardBeds = beds.filter(
              (bed) => String(bed.ward_id) === String(ward.id)
            );
            const displayBeds =
              statusFilter === "ALL"
                ? wardBeds
                : wardBeds.filter(
                    (bed) =>
                      String(bed.status).toUpperCase() === statusFilter
                  );
            const available = wardBeds.filter(
              (bed) => String(bed.status).toUpperCase() === "AVAILABLE"
            ).length;
            const occupied = wardBeds.filter(
              (bed) => String(bed.status).toUpperCase() === "OCCUPIED"
            ).length;
            const total = wardBeds.length;
            const occupancy = total > 0 ? Math.round((occupied / total) * 100) : 0;

            return (
              <WardCard
                key={ward.id}
                ward={ward}
                beds={displayBeds}
                available={available}
                occupied={occupied}
                total={total}
                occupancy={occupancy}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===================== WARD CARD ===================== */

function WardCard({ ward, beds, available, occupied, total, occupancy }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-100">
      <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{ward.name}</h3>
            <p className="mt-1 text-sm text-slate-500">
              Floor {ward.floor || "N/A"} · {total} beds
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 group-hover:shadow-sm">
            {occupancy}% full
          </span>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              {available} free
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              {occupied} used
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-rose-400 transition-all duration-700"
              style={{ width: `${occupancy}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-5">
        {beds.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
            No beds match this filter.
          </p>
        ) : (
          <div className="space-y-2">
            {beds.map((bed) => (
              <BedRow key={bed.id} bed={bed} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== BED ROW ===================== */

function BedRow({ bed }) {
  const status = String(bed.status || "UNKNOWN").toUpperCase();
  const statusStyles = {
    AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    OCCUPIED: "bg-rose-50 text-rose-700 ring-rose-200",
    MAINTENANCE: "bg-amber-50 text-amber-700 ring-amber-200",
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:bg-slate-50 hover:shadow">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 ring-1 ring-slate-200">
          <BedIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Bed {bed.bed_number}
          </p>
          <p className="text-xs text-slate-400">ID #{bed.id}</p>
        </div>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
          statusStyles[status] || "bg-slate-100 text-slate-600 ring-slate-200"
        }`}
      >
        {status}
      </span>
    </div>
  );
}