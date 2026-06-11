import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";

/* ===================== ICONS ===================== */

const MedicalIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
    <path
      d="M7 3.75H14.5L19 8.25V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V5.75C5 4.65 5.9 3.75 7 3.75Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M14.5 3.75V8.25H19"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M9 13H15M12 10V16"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <path
      d="M11 18C14.866 18 18 14.866 18 11C18 7.134 14.866 4 11 4C7.134 4 4 7.134 4 11C4 14.866 7.134 18 11 18Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M16.5 16.5L20 20"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const EditIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 20H8L18.5 9.5C19.6 8.4 19.6 6.6 18.5 5.5C17.4 4.4 15.6 4.4 14.5 5.5L4 16V20Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 7H18M10 11V17M14 11V17M9 7L9.5 5H14.5L15 7M8 7L8.8 20H15.2L16 7"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 6L18 18M18 6L6 18"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const LinkIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path
      d="M10 13.5L14 9.5M8.5 15.5L7.8 16.2C6.5 17.5 4.5 17.5 3.2 16.2C1.9 14.9 1.9 12.9 3.2 11.6L6.4 8.4C7.7 7.1 9.7 7.1 11 8.4M13 15.6C14.3 16.9 16.3 16.9 17.6 15.6L20.8 12.4C22.1 11.1 22.1 9.1 20.8 7.8C19.5 6.5 17.5 6.5 16.2 7.8L15.5 8.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const EmptyIcon = () => (
  <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none">
    <path
      d="M7 4H17C18.1 4 19 4.9 19 6V18C19 19.1 18.1 20 17 20H7C5.9 20 5 19.1 5 18V6C5 4.9 5.9 4 7 4Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M9 9H15M9 13H15M9 17H12"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const SuccessIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12.5L9.5 17L19 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 8V12M12 16H12.01M21 12C21 17 17 21 12 21C7 21 3 17 3 12C3 7 7 3 12 3C17 3 21 7 21 12Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const WarningIcon = () => (
  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 4L21 20H3L12 4Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M12 9V13M12 17H12.01"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

/* ===================== CUSTOM TOAST ===================== */

function CustomToast({ toast, onClose }) {
  if (!toast) return null;

  const success = toast.type === "success";

  return (
    <div className="fixed right-4 top-4 z-[9999] w-[calc(100%-2rem)] max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl ${
          success
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            success ? "bg-emerald-100" : "bg-red-100"
          }`}
        >
          {success ? <SuccessIcon /> : <ErrorIcon />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">
            {success ? "Success" : "Error"}
          </p>
          <p className="mt-0.5 text-sm font-semibold leading-5">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className={`rounded-lg p-1 ${
            success ? "hover:bg-emerald-100" : "hover:bg-red-100"
          }`}
          aria-label="Close toast"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

/* ===================== DELETE CONFIRM MODAL ===================== */

function DeleteConfirmModal({
  record,
  deleting,
  onCancel,
  onConfirm,
  formatDate,
}) {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
            <WarningIcon />
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-950">
            Delete Medical Record?
          </h2>

          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            This action cannot be undone. Please confirm before deleting this
            medical record.
          </p>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                Record ID
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">
                #{record.id}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                Patient ID
              </span>
              <span className="text-sm font-black text-slate-800">
                {record.patient_id || "N/A"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                Type
              </span>
              <span className="text-sm font-black text-blue-700">
                {record.record_type || "Medical Record"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                Date
              </span>
              <span className="text-sm font-black text-slate-700">
                {formatDate(record.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {deleting ? "Deleting..." : "Delete Record"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== COMPONENT ===================== */

export default function AdminMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const [form, setForm] = useState({
    record_type: "",
    description: "",
    file_url: "",
  });

  useEffect(() => {
    fetchRecords(true);

    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchRecords = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      const res = await api.get("/medical-records/my");
      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("error", "Failed to load medical records");
    } finally {
      setLoading(false);
    }
  };

  const recordTypes = useMemo(() => {
    const types = records
      .map((rec) => rec.record_type)
      .filter(Boolean)
      .map((type) => type.trim());

    return [...new Set(types)].sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return records.filter((rec) => {
      const matchesSearch =
        !keyword ||
        String(rec.id || "").toLowerCase().includes(keyword) ||
        String(rec.patient_id || "").toLowerCase().includes(keyword) ||
        String(rec.record_type || "").toLowerCase().includes(keyword) ||
        String(rec.description || "").toLowerCase().includes(keyword);

      const matchesType =
        typeFilter === "ALL" || rec.record_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [records, search, typeFilter]);

  const uniquePatients = useMemo(() => {
    return new Set(records.map((rec) => rec.patient_id).filter(Boolean)).size;
  }, [records]);

  const latestRecordDate = useMemo(() => {
    if (!records.length) return "N/A";

    const dates = records
      .map((rec) => new Date(rec.created_at))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => b - a);

    return dates.length ? formatDate(dates[0]) : "N/A";
  }, [records]);

  const openEditModal = (rec) => {
    setEditingRecord(rec);
    setForm({
      record_type: rec.record_type || "",
      description: rec.description || "",
      file_url: rec.file_url || "",
    });
  };

  const closeEditModal = () => {
    setEditingRecord(null);
    setForm({
      record_type: "",
      description: "",
      file_url: "",
    });
  };

  const openDeleteModal = (rec) => {
    setDeleteRecord(rec);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteRecord(null);
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    if (!editingRecord) return;

    if (!form.record_type.trim()) {
      showToast("error", "Record type is required");
      return;
    }

    if (!form.description.trim()) {
      showToast("error", "Description is required");
      return;
    }

    try {
      setSaving(true);

      await api.put(`/medical-records/${editingRecord.id}`, form);
      await fetchRecords(false);

      showToast("success", "Medical record updated successfully");
      closeEditModal();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast("error", typeof detail === "string" ? detail : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteRecord) return;

    try {
      setDeleting(true);

      await api.delete(`/medical-records/${deleteRecord.id}`);
      await fetchRecords(false);

      showToast("success", "Medical record deleted successfully");
      setDeleteRecord(null);
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast("error", typeof detail === "string" ? detail : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  function formatDate(dateValue) {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <>
        <CustomToast toast={toast} onClose={() => setToast(null)} />

        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-[2rem] bg-slate-100" />
          <div className="grid gap-4 md:grid-cols-4">
            <div className="h-28 animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-28 animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-28 animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-28 animate-pulse rounded-3xl bg-slate-100" />
          </div>
          <div className="h-96 animate-pulse rounded-[2rem] bg-slate-100" />
        </div>
      </>
    );
  }

  return (
    <>
      <CustomToast toast={toast} onClose={() => setToast(null)} />

      <DeleteConfirmModal
        record={deleteRecord}
        deleting={deleting}
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        formatDate={formatDate}
      />

      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-xl shadow-slate-200">
          <div className="relative p-6 md:p-8">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/30 blur-3xl" />
            <div className="absolute -bottom-20 left-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-200 ring-1 ring-white/10 backdrop-blur">
                  <MedicalIcon />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                    Medical Records Control
                  </p>

                  <h1 className="mt-2 text-2xl font-black tracking-tight md:text-4xl">
                    Records Management
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                    Review patient documents, update record details, and manage
                    uploaded medical files from a focused admin workspace.
                  </p>
                </div>
              </div>

              <button
                onClick={() => fetchRecords(true)}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Total Records</p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {records.length}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Patients</p>
            <p className="mt-2 text-3xl font-black text-blue-600">
              {uniquePatients}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Record Types</p>
            <p className="mt-2 text-3xl font-black text-violet-600">
              {recordTypes.length}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Latest Record</p>
            <p className="mt-2 text-lg font-black text-emerald-600">
              {latestRecordDate}
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                All Medical Records
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Showing {filteredRecords.length} of {records.length} records.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500 md:w-80">
                <SearchIcon />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ml-3 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder="Search ID, patient, type..."
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-black text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              >
                <option value="ALL">All Types</option>
                {recordTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {filteredRecords.length > 0 ? (
          <section className="grid gap-5 xl:grid-cols-2">
            {filteredRecords.map((rec) => (
              <article
                key={rec.id}
                className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="flex items-start gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <MedicalIcon />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Record #{rec.id}
                        </p>

                        <h3 className="mt-1 text-lg font-black text-slate-950">
                          {rec.record_type || "Medical Record"}
                        </h3>
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                        {formatDate(rec.created_at)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                        Patient ID: {rec.patient_id || "N/A"}
                      </span>

                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                        Active Record
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
                      {rec.description || "No description available."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {rec.file_url ? (
                      <a
                        href={rec.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-800"
                      >
                        <LinkIcon />
                        View Attached File
                      </a>
                    ) : (
                      <p className="text-sm font-bold text-slate-400">
                        No file attached
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(rec)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                    >
                      <EditIcon />
                      Edit
                    </button>

                    <button
                      onClick={() => openDeleteModal(rec)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-600 hover:text-white"
                    >
                      <DeleteIcon />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-100 text-slate-400">
              <EmptyIcon />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-950">
              No records found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
              No medical records match your current search or filter.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("ALL");
              }}
              className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Clear Filters
            </button>
          </section>
        )}

        {editingRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-200 p-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                    Edit Record #{editingRecord.id}
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Update Medical Record
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Patient ID: {editingRecord.patient_id || "N/A"}
                  </p>
                </div>

                <button
                  onClick={closeEditModal}
                  className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                  aria-label="Close modal"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    Record Type
                  </label>
                  <input
                    type="text"
                    name="record_type"
                    value={form.record_type}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="Example: Prescription, Lab Report, Diagnosis"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="5"
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="Enter medical record description"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    File URL
                  </label>
                  <input
                    type="text"
                    name="file_url"
                    value={form.file_url}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="https://example.com/file.pdf"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:justify-end">
                <button
                  onClick={closeEditModal}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}