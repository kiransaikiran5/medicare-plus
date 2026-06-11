import { useEffect, useState } from "react";
import api from "../../services/api";

/* ===== Inline SVG Icons ===== */
const DownloadIcon = () => (
  <svg
    className="mr-1.5 h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="h-6 w-6 text-slate-400"
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

const ReportIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 3.75H14.5L19 8.25V20.25H7A2 2 0 015 18.25V5.75A2 2 0 017 3.75Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.5 3.75V8.25H19M8.5 13H15.5M8.5 16H14"
    />
  </svg>
);

/* ===== Toast Component ===== */
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

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("appointments");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingType, setDownloadingType] = useState("");

  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [apptSummary, setApptSummary] = useState(null);
  const [apptStatusFilter, setApptStatusFilter] = useState("");

  // Medical state
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [medPatientFilter, setMedPatientFilter] = useState("");
  const [medTypeFilter, setMedTypeFilter] = useState("");

  // Billing state
  const [bills, setBills] = useState([]);
  const [billSummary, setBillSummary] = useState(null);
  const [billStatusFilter, setBillStatusFilter] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 4000);

    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (activeTab === "appointments") {
      fetchAppointments();
      fetchAppointmentSummary();
    }

    if (activeTab === "medical") {
      fetchMedicalRecords();
    }

    if (activeTab === "billing") {
      fetchBills();
      fetchBillingSummary();
    }
  }, [
    activeTab,
    apptStatusFilter,
    medPatientFilter,
    medTypeFilter,
    billStatusFilter,
  ]);

  // ---------- Fetch functions ----------
  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const params = {};
      if (apptStatusFilter) params.status_filter = apptStatusFilter;

      const res = await api.get("/reports/appointments", { params });
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("Failed to load appointments", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentSummary = async () => {
    try {
      const res = await api.get("/reports/appointments/summary");
      setApptSummary(res.data || null);
    } catch (err) {
      showToast("Failed to load appointment summary", "error");
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);

      const params = {};
      if (medPatientFilter) params.patient_id = medPatientFilter;
      if (medTypeFilter) params.record_type = medTypeFilter;

      const res = await api.get("/reports/medical", { params });
      setMedicalRecords(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("Failed to load medical records", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      setLoading(true);

      const params = {};
      if (billStatusFilter) params.status_filter = billStatusFilter;

      const res = await api.get("/reports/billing", { params });
      setBills(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("Failed to load bills", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchBillingSummary = async () => {
    try {
      const res = await api.get("/reports/billing/summary");
      setBillSummary(res.data || null);
    } catch (err) {
      showToast("Failed to load billing summary", "error");
    }
  };

  // ---------- Download PDF ----------
  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken")
    );
  };

  const getPdfParams = (type) => {
    const params = {};

    if (type === "appointments" && apptStatusFilter) {
      params.status_filter = apptStatusFilter;
    }

    if (type === "medical") {
      if (medPatientFilter) params.patient_id = medPatientFilter;
      if (medTypeFilter) params.record_type = medTypeFilter;
    }

    if (type === "billing" && billStatusFilter) {
      params.status_filter = billStatusFilter;
    }

    return params;
  };

  const getPdfFileName = (type) => {
    const today = new Date().toISOString().slice(0, 10);

    if (type === "appointments") {
      return `appointments-report-${apptStatusFilter || "all"}-${today}.pdf`;
    }

    if (type === "medical") {
      return `medical-records-report-${today}.pdf`;
    }

    if (type === "billing") {
      return `billing-report-${billStatusFilter || "all"}-${today}.pdf`;
    }

    return `report-${today}.pdf`;
  };

  const readBlobError = async (error) => {
    try {
      const blob = error.response?.data;

      if (blob instanceof Blob) {
        const text = await blob.text();
        const json = JSON.parse(text);
        return json.detail || "PDF download failed";
      }

      return error.response?.data?.detail || "PDF download failed";
    } catch {
      return "PDF download failed";
    }
  };

  const downloadPDF = async (type) => {
    try {
      setDownloadingType(type);

      const token = getToken();

      if (!token) {
        showToast("Login token missing. Please login again.", "error");
        return;
      }

      const res = await api.get(`/reports/${type}/pdf`, {
        params: getPdfParams(type),
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const fileURL = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = fileURL;
      link.download = getPdfFileName(type);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(fileURL);

      showToast("PDF downloaded successfully", "success");
    } catch (err) {
      const message = await readBlobError(err);
      showToast(message, "error");
    } finally {
      setDownloadingType("");
    }
  };

  // ---------- Helpers ----------
  const formatIST = (dateStr, showTime = false) => {
    if (!dateStr) return "—";

    const date =
      String(dateStr).includes("+") || String(dateStr).includes("Z")
        ? new Date(dateStr)
        : new Date(`${dateStr}Z`);

    if (Number.isNaN(date.getTime())) return "—";

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

  const formatAmount = (amount) => {
    const value = Number(amount || 0);

    return value.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });
  };

  const isDownloading = (type) => downloadingType === type;

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-0">
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Header */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
                <ReportIcon />
                Admin Reports
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-950">
                Reports & Downloads
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
                View and download professional PDF reports.
            </p>
            </div>

            <div className="w-fit rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">
            Secure PDF Export
            </div>
        </div>
        </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
        {["appointments", "medical", "billing"].map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-2xl px-5 py-2.5 text-sm font-black capitalize transition ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments Tab */}
      {activeTab === "appointments" && (
        <section>
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm font-black text-slate-700">
                Status
              </label>

              <select
                value={apptStatusFilter}
                onChange={(e) => setApptStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => downloadPDF("appointments")}
              disabled={isDownloading("appointments")}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <DownloadIcon />
              {isDownloading("appointments") ? "Downloading..." : "Download PDF"}
            </button>
          </div>

          {apptSummary && (
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
              <SummaryCard label="Total" value={apptSummary.total} color="text-slate-900" />
              <SummaryCard label="Pending" value={apptSummary.pending} color="text-amber-600" />
              <SummaryCard label="Confirmed" value={apptSummary.confirmed} color="text-blue-600" />
              <SummaryCard label="Cancelled" value={apptSummary.cancelled} color="text-red-600" />
              <SummaryCard label="Completed" value={apptSummary.completed} color="text-emerald-600" />
            </div>
          )}

          <ReportTable
            loading={loading}
            emptyTitle="No appointments"
            emptyText="No appointment records match your filters."
            headers={["ID", "Patient", "Doctor", "Time", "Status", "Reason"]}
          >
            {appointments.map((appt) => (
              <tr key={appt.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                  #{appt.id}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {appt.patient_id}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {appt.doctor_id}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatIST(appt.appointment_time, true)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={appt.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {appt.reason || "—"}
                </td>
              </tr>
            ))}
          </ReportTable>
        </section>
      )}

      {/* Medical Tab */}
      {activeTab === "medical" && (
        <section>
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="number"
                placeholder="Patient ID"
                value={medPatientFilter}
                onChange={(e) => setMedPatientFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

              <select
                value={medTypeFilter}
                onChange={(e) => setMedTypeFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="">All Types</option>
                <option value="Diagnosis">Diagnosis</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Prescription History">Prescription History</option>
                <option value="Allergy">Allergy</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => downloadPDF("medical")}
              disabled={isDownloading("medical")}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <DownloadIcon />
              {isDownloading("medical") ? "Downloading..." : "Download PDF"}
            </button>
          </div>

          <ReportTable
            loading={loading}
            emptyTitle="No medical records"
            emptyText="No medical records match your filters."
            headers={["ID", "Patient", "Type", "Description", "Date"]}
          >
            {medicalRecords.map((rec) => (
              <tr key={rec.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                  #{rec.id}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {rec.patient_id}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-700">
                  {rec.record_type || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {rec.description || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatIST(rec.created_at)}
                </td>
              </tr>
            ))}
          </ReportTable>
        </section>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <section>
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm font-black text-slate-700">
                Status
              </label>

              <select
                value={billStatusFilter}
                onChange={(e) => setBillStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => downloadPDF("billing")}
              disabled={isDownloading("billing")}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <DownloadIcon />
              {isDownloading("billing") ? "Downloading..." : "Download PDF"}
            </button>
          </div>

          {billSummary && (
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <SummaryCard
                label="Total Bills"
                value={billSummary.total_bills}
                color="text-slate-900"
              />
              <SummaryCard
                label="Total Amount"
                value={formatAmount(billSummary.total_amount)}
                color="text-slate-900"
              />
              <SummaryCard
                label="Paid"
                value={formatAmount(billSummary.paid_amount)}
                color="text-emerald-600"
              />
              <SummaryCard
                label="Unpaid"
                value={formatAmount(billSummary.unpaid_amount)}
                color="text-red-600"
              />
            </div>
          )}

          <ReportTable
            loading={loading}
            emptyTitle="No bills"
            emptyText="No billing records match your filters."
            headers={["ID", "Patient", "Amount", "Status", "Method", "Date"]}
          >
            {bills.map((bill) => (
              <tr key={bill.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                  #{bill.id}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {bill.patient_id}
                </td>
                <td className="px-6 py-4 text-sm font-black text-slate-900">
                  {formatAmount(bill.amount)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={bill.status} type="billing" />
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {bill.payment_method || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatIST(bill.created_at)}
                </td>
              </tr>
            ))}
          </ReportTable>
        </section>
      )}
    </div>
  );
}

/* ===== Reusable Components ===== */

function SummaryCard({ label, value, color }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-black ${color}`}>{value ?? 0}</p>
    </div>
  );
}

function ReportTable({ loading, emptyTitle, emptyText, headers, children }) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <svg
          className="mx-auto h-9 w-9 animate-spin text-blue-600"
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
        <p className="mt-3 text-sm font-bold text-slate-500">Loading...</p>
      </div>
    );
  }

  const rows = Array.isArray(children) ? children : [children];
  const hasRows = rows.filter(Boolean).length > 0;

  if (!hasRows) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50">
          <CalendarIcon />
        </div>
        <h3 className="text-base font-black text-slate-950">{emptyTitle}</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              {headers.map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-6 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status, type = "appointment" }) {
  const value = status || "N/A";

  const apptColors = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
    CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-100",
    CANCELLED: "bg-red-50 text-red-700 ring-red-100",
    COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };

  const billColors = {
    PAID: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    UNPAID: "bg-red-50 text-red-700 ring-red-100",
  };

  const colors = type === "billing" ? billColors : apptColors;
  const statusColor = colors[value] || "bg-slate-50 text-slate-700 ring-slate-100";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusColor}`}
    >
      {value}
    </span>
  );
}