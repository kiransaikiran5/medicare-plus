import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

/* ===================== METRICS ===================== */

const METRIC_TYPES = [
  {
    key: "weight",
    label: "Weight",
    unit: "kg",
    placeholder: "e.g., 70.5",
    color: "blue",
    normal: "Track body weight changes",
  },
  {
    key: "height",
    label: "Height",
    unit: "cm",
    placeholder: "e.g., 170",
    color: "violet",
    normal: "Maintain growth profile",
  },
  {
    key: "systolic_bp",
    label: "Systolic BP",
    unit: "mmHg",
    placeholder: "e.g., 120",
    color: "red",
    normal: "Ideal around 120",
  },
  {
    key: "diastolic_bp",
    label: "Diastolic BP",
    unit: "mmHg",
    placeholder: "e.g., 80",
    color: "orange",
    normal: "Ideal around 80",
  },
  {
    key: "sugar",
    label: "Blood Sugar",
    unit: "mg/dL",
    placeholder: "e.g., 95",
    color: "emerald",
    normal: "Monitor sugar trend",
  },
];

const COLOR_MAP = {
  blue: {
    gradient: "from-blue-600 to-cyan-500",
    soft: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
    ring: "ring-blue-100",
    chart: "#2563eb",
    chartSoft: "rgba(37, 99, 235, 0.12)",
  },
  violet: {
    gradient: "from-violet-600 to-fuchsia-500",
    soft: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-100",
    ring: "ring-violet-100",
    chart: "#7c3aed",
    chartSoft: "rgba(124, 58, 237, 0.12)",
  },
  red: {
    gradient: "from-red-600 to-rose-500",
    soft: "bg-red-50",
    text: "text-red-700",
    border: "border-red-100",
    ring: "ring-red-100",
    chart: "#dc2626",
    chartSoft: "rgba(220, 38, 38, 0.12)",
  },
  orange: {
    gradient: "from-orange-500 to-amber-500",
    soft: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-100",
    ring: "ring-orange-100",
    chart: "#ea580c",
    chartSoft: "rgba(234, 88, 12, 0.12)",
  },
  emerald: {
    gradient: "from-emerald-600 to-teal-500",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    ring: "ring-emerald-100",
    chart: "#059669",
    chartSoft: "rgba(5, 150, 105, 0.12)",
  },
};

/* ===================== ICONS ===================== */

const PlusIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const CloseIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SaveIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0a9 9 0 0118 0z" />
  </svg>
);

const HeartIcon = ({ className = "h-6 w-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.015-4.5-4.5-4.5A4.49 4.49 0 0012 6.15a4.49 4.49 0 00-4.5-2.4C5.015 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const ChartIcon = ({ className = "h-6 w-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5m0 14h16M8 16v-5m4 5V8m4 8v-7" />
  </svg>
);

const EmptyIcon = ({ className = "h-8 w-8" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M7 3.75h7.5L19 8.25v12H7A2 2 0 015 18.25V5.75A2 2 0 017 3.75z" />
  </svg>
);

/* ===================== TOAST ===================== */

function Toast({ toast, onClose }) {
  if (!toast?.message) return null;

  const isSuccess = toast.type === "success";

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

export default function HealthTracker() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("weight");
  const [formValue, setFormValue] = useState("");
  const [chartType, setChartType] = useState("weight");

  const selectedMetric = METRIC_TYPES.find((item) => item.key === chartType) || METRIC_TYPES[0];
  const selectedColors = COLOR_MAP[selectedMetric.color];

  const formMetric = METRIC_TYPES.find((item) => item.key === formType) || METRIC_TYPES[0];
  const formColors = COLOR_MAP[formMetric.color];

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      const res = await api.get("/health-metrics/my");
      setMetrics(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("Failed to load metrics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 4000);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleAdd = async (e) => {
    e.preventDefault();

    const numericValue = Number(formValue);

    if (!formValue || Number.isNaN(numericValue)) {
      showToast("Please enter a valid value", "error");
      return;
    }

    try {
      setSaving(true);

      await api.post("/health-metrics/", {
        metric_type: formType,
        value: numericValue,
        unit: formMetric.unit,
      });

      showToast("Measurement added successfully", "success");
      setShowForm(false);
      setFormValue("");
      fetchMetrics();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(typeof detail === "string" ? detail : "Failed to add metric", "error");
    } finally {
      setSaving(false);
    }
  };

  const formatIST = (dateStr, showTime = false) => {
    if (!dateStr) return "N/A";

    const value = String(dateStr);
    const date =
      value.includes("+") || value.includes("Z")
        ? new Date(value)
        : new Date(`${value}Z`);

    if (Number.isNaN(date.getTime())) return "N/A";

    if (showTime) {
      return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  const sortedMetrics = useMemo(() => {
    return [...metrics].sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
  }, [metrics]);

  const filteredMetrics = useMemo(() => {
    return metrics
      .filter((item) => item.metric_type === chartType)
      .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
  }, [metrics, chartType]);

  const latestByMetric = useMemo(() => {
    const latest = {};

    sortedMetrics.forEach((item) => {
      if (!latest[item.metric_type]) {
        latest[item.metric_type] = item;
      }
    });

    return latest;
  }, [sortedMetrics]);

  const latestSelected = latestByMetric[chartType];

  const chartData = {
    labels: filteredMetrics.map((item) => formatIST(item.recorded_at)),
    datasets: [
      {
        label: selectedMetric.label,
        data: filteredMetrics.map((item) => item.value),
        borderColor: selectedColors.chart,
        backgroundColor: selectedColors.chartSoft,
        pointBackgroundColor: selectedColors.chart,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 3,
        tension: 0.38,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#ffffff",
        bodyColor: "#e2e8f0",
        padding: 12,
        cornerRadius: 14,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} ${selectedMetric.unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 11,
            weight: "600",
          },
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(148, 163, 184, 0.18)",
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 11,
            weight: "600",
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <svg
            className="mx-auto h-10 w-10 animate-spin text-blue-600"
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

          <p className="mt-3 text-sm font-bold text-slate-500">
            Loading health dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-0">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className={`bg-gradient-to-r ${formColors.gradient} p-6 text-white`}>
              <div className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white/85">
                New Record
              </div>

              <h2 className="text-2xl font-black">Add Measurement</h2>

              <p className="mt-1 text-sm font-medium text-white/80">
                Save your latest health reading.
              </p>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-black text-slate-700">
                  Metric Type
                </label>

                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  {METRIC_TYPES.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label} ({item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-black text-slate-700">
                  Value ({formMetric.unit})
                </label>

                <input
                  type="number"
                  step="0.1"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  placeholder={formMetric.placeholder}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormValue("");
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
                >
                  <CloseIcon />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <SaveIcon />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Header */}
      <div className="mb-6 overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-sm">
        <div className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-700 p-6 text-white">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-32 w-32 rounded-full bg-blue-300/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-blue-100 ring-1 ring-white/15">
                <HeartIcon className="h-4 w-4" />
                Patient Wellness Center
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Health Tracker
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-blue-100">
                Monitor vital readings, compare trends, and keep your medical
                lifestyle data organized in one smart dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
                <p className="text-xs font-bold text-blue-100">Total Records</p>
                <p className="mt-1 text-2xl font-black">{metrics.length}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-sm transition hover:bg-blue-50"
              >
                <PlusIcon />
                Add Measurement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {METRIC_TYPES.map((metric) => {
          const latest = latestByMetric[metric.key];

          return (
            <MetricCard
              key={metric.key}
              metric={metric}
              latest={latest}
              active={chartType === metric.key}
              onClick={() => setChartType(metric.key)}
              formatIST={formatIST}
            />
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="mb-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        {/* Chart */}
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center">
            <div>
              <div className={`mb-2 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${selectedColors.soft} ${selectedColors.text}`}>
                Trend Analysis
              </div>

              <h2 className="text-xl font-black text-slate-950">
                {selectedMetric.label} Trend
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {filteredMetrics.length} record
                {filteredMetrics.length === 1 ? "" : "s"} for this metric
              </p>
            </div>

            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 md:w-56"
            >
              {METRIC_TYPES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {filteredMetrics.length > 0 ? (
            <div className="h-80 p-5 sm:h-[420px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="flex h-80 flex-col items-center justify-center p-8 text-center sm:h-[420px]">
              <div className={`flex h-16 w-16 items-center justify-center rounded-3xl ${selectedColors.soft} ${selectedColors.text}`}>
                <ChartIcon />
              </div>

              <h3 className="mt-4 text-base font-black text-slate-950">
                No {selectedMetric.label} data yet
              </h3>

              <p className="mt-1 max-w-sm text-sm font-medium text-slate-500">
                Add your first value to generate a clear health trend chart.
              </p>

              <button
                type="button"
                onClick={() => {
                  setFormType(chartType);
                  setShowForm(true);
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
              >
                <PlusIcon />
                Add First Record
              </button>
            </div>
          )}
        </div>

        {/* Insight Panel */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            Latest Insight
          </p>

          <div className={`mt-4 rounded-3xl bg-gradient-to-br ${selectedColors.gradient} p-5 text-white shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white/75">
                  {selectedMetric.label}
                </p>

                <p className="mt-2 text-4xl font-black">
                  {latestSelected ? latestSelected.value : "--"}
                  <span className="ml-1 text-base font-bold text-white/75">
                    {latestSelected ? selectedMetric.unit : ""}
                  </span>
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <HeartIcon />
              </div>
            </div>

            <p className="mt-5 text-sm font-medium leading-6 text-white/80">
              {latestSelected
                ? `Recorded on ${formatIST(latestSelected.recorded_at, true)}`
                : "No reading is available for this metric yet."}
            </p>
          </div>

          <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-sm font-black text-slate-950">
              Health Note
            </p>

            <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
              {selectedMetric.normal}. Keep adding measurements regularly for
              more useful trend visibility.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFormType(chartType);
              setShowForm(true);
            }}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
          >
            <PlusIcon />
            Add {selectedMetric.label}
          </button>
        </div>
      </div>

      {/* Recent Table */}
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Measurement History
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              Recent Measurements
            </h2>
          </div>

          <div className="w-fit rounded-2xl bg-slate-50 px-4 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200">
            Showing latest 20 records
          </div>
        </div>

        {metrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
              <EmptyIcon />
            </div>

            <h3 className="mt-4 text-base font-black text-slate-950">
              No measurements recorded
            </h3>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Start by adding your first health metric.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Date</TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sortedMetrics.slice(0, 20).map((item) => {
                  const metric =
                    METRIC_TYPES.find((metricItem) => metricItem.key === item.metric_type) ||
                    METRIC_TYPES[0];

                  const colors = COLOR_MAP[metric.color];

                  return (
                    <tr key={item.id} className="transition hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${colors.soft} ${colors.text}`}>
                            <HeartIcon className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="text-sm font-black text-slate-950">
                              {metric.label}
                            </p>
                            <p className="text-xs font-bold text-slate-400">
                              Health measurement
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm font-black text-slate-900">
                        {item.value}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-500">
                        {item.unit}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-500">
                        {formatIST(item.recorded_at, true)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== COMPONENTS ===================== */

function MetricCard({ metric, latest, active, onClick, formatIST }) {
  const colors = COLOR_MAP[metric.color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-[26px] border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? `${colors.border} ring-4 ${colors.ring}`
          : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colors.gradient} text-white shadow-sm`}>
          <HeartIcon className="h-6 w-6" />
        </div>

        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${colors.soft} ${colors.text}`}>
          {metric.unit}
        </span>
      </div>

      <p className="mt-4 text-sm font-black text-slate-500">
        {metric.label}
      </p>

      <div className="mt-1 flex items-end gap-1">
        <span className="text-2xl font-black text-slate-950">
          {latest ? latest.value : "--"}
        </span>

        <span className="pb-1 text-xs font-bold text-slate-400">
          {latest ? metric.unit : ""}
        </span>
      </div>

      <p className="mt-2 text-xs font-bold text-slate-400">
        {latest ? formatIST(latest.recorded_at) : "No record yet"}
      </p>
    </button>
  );
}

function TableHead({ children }) {
  return (
    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500">
      {children}
    </th>
  );
}