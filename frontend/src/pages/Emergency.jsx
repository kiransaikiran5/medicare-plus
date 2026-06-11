import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

/* ===================== ICONS ===================== */

const PhoneIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25A2.25 2.25 0 0021.75 19.5v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102A1.125 1.125 0 005.872 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LocationIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M15 10.5a3 3 0 11-6 0a3 3 0 016 0z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UserIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 12.5a4 4 0 100-8a4 4 0 000 8z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M5 20c.9-3.2 3.6-5 7-5s6.1 1.8 7 5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const CopyIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M8 8V6.5C8 5.7 8.7 5 9.5 5h9c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5H17"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.5 8h9c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5h-9c-.8 0-1.5-.7-1.5-1.5v-9C4 8.7 4.7 8 5.5 8z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

const AlertIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 9v4m0 4h.01M10.3 4.3L2.9 17.2c-.8 1.4.2 3.1 1.8 3.1h14.6c1.6 0 2.6-1.7 1.8-3.1L13.7 4.3c-.8-1.4-2.6-1.4-3.4 0z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ===================== TOAST ===================== */

function Toast({ toast, onClose }) {
  if (!toast?.message) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`
        fixed right-4 top-4 z-[9999] flex max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-xl
        ${
          isSuccess
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-800"
        }
      `}
    >
      <div
        className={`
          flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black
          ${isSuccess ? "bg-emerald-100" : "bg-red-100"}
        `}
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

export default function EmergencyPage() {
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const cleanPhone = (phone) => {
    return String(phone || "")
      .replace(/[^\d+]/g, "")
      .replace(/(?!^)\+/g, "");
  };

  const copyNumber = async (phone) => {
    const number = cleanPhone(phone);

    if (!number) {
      showToast("Phone number not available", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(number);
      showToast("Phone number copied", "success");
    } catch (err) {
      showToast("Unable to copy number", "error");
    }
  };

  const fetchEmergencyData = async () => {
    try {
      setLoading(true);

      const [infoRes, contactsRes] = await Promise.all([
        api.get("/emergency/hospital-info"),
        api.get("/emergency/contacts/my").catch(() => ({ data: [] })),
      ]);

      setHospitalInfo(infoRes.data || null);
      setContacts(Array.isArray(contactsRes.data) ? contactsRes.data : []);
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Failed to load emergency information";
      showToast(detail, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyData();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  const hospitalNumber = cleanPhone(hospitalInfo?.emergency_number);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-5 h-40 animate-pulse rounded-3xl bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
          <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-0">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="mb-6 rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-red-700">
              <AlertIcon className="h-4 w-4" />
              Emergency Access
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              Quick Emergency
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
              Call the hospital hotline or reach your saved emergency contacts
              quickly.
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
            ● Ready
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Hospital Card */}
        <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-red-700 to-red-500 p-6 text-white">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-100">
              Hospital Hotline
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {hospitalInfo?.hospital_name || "MediCare Plus"}
            </h2>

            <div className="mt-3 flex items-start gap-2 text-sm font-medium text-red-50">
              <LocationIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {hospitalInfo?.address || "Hospital address not available"}
              </span>
            </div>
          </div>

          <div className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Emergency Number
            </p>

            <p className="mt-2 break-all text-4xl font-black text-red-600">
              {hospitalInfo?.emergency_number || "N/A"}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a
                href={hospitalNumber ? `tel:${hospitalNumber}` : undefined}
                onClick={(e) => {
                  if (!hospitalNumber) {
                    e.preventDefault();
                    showToast("Emergency number not available", "error");
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
              >
                <PhoneIcon />
                Call Now
              </a>

              <button
                type="button"
                onClick={() => copyNumber(hospitalInfo?.emergency_number)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
              >
                <CopyIcon />
                Copy Number
              </button>
            </div>

            <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-500">
              On desktop, browser may ask to open a calling app. On mobile, it
              opens the phone dialer directly.
            </p>
          </div>
        </div>

        {/* Contacts Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Personal Contacts
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Emergency Contacts
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {contacts.length} saved contact
                {contacts.length === 1 ? "" : "s"}
              </p>
            </div>

            <Link
              to="/patient/emergency-contacts"
              className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm font-black text-red-700 ring-1 ring-red-100 transition hover:bg-red-600 hover:text-white"
            >
              Manage
            </Link>
          </div>

          {contacts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <UserIcon className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-base font-black text-slate-950">
                No contacts added
              </h3>

              <p className="mt-2 text-sm font-medium text-slate-500">
                Add family members or trusted people for quick emergency access.
              </p>

              <Link
                to="/patient/emergency-contacts"
                className="mt-5 inline-flex rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
              >
                Add Contact
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => {
                const phone = cleanPhone(contact.phone);

                return (
                  <div
                    key={contact.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-red-200 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600 ring-1 ring-slate-200">
                          <UserIcon />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-black text-slate-950">
                            {contact.name || "Unnamed Contact"}
                          </h3>

                          <p className="text-xs font-bold text-slate-500">
                            {contact.relationship || "Contact"}
                          </p>

                          <p className="mt-1 font-mono text-sm font-black text-slate-800">
                            {contact.phone || "N/A"}
                          </p>
                        </div>
                      </div>

                      <a
                        href={phone ? `tel:${phone}` : undefined}
                        onClick={(e) => {
                          if (!phone) {
                            e.preventDefault();
                            showToast("Phone number not available", "error");
                          }
                        }}
                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white transition hover:bg-red-700"
                      >
                        <PhoneIcon className="h-4 w-4" />
                        Call
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyNumber(contact.phone)}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                    >
                      <CopyIcon />
                      Copy Number
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}