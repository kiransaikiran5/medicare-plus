import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

/* ===================== ICONS ===================== */

const CalendarIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4V7M17 4V7M5.5 6H18.5C19.3 6 20 6.7 20 7.5V18.5C20 19.3 19.3 20 18.5 20H5.5C4.7 20 4 19.3 4 18.5V7.5C4 6.7 4.7 6 5.5 6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 10H20" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V12L16 14M21 12C21 17 17 21 12 21C7 21 3 17 3 12C3 7 7 3 12 3C17 3 21 7 21 12Z" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5C3 6.7 3.7 6 4.5 6H19.5C20.3 6 21 6.7 21 7.5V16.5C21 17.3 20.3 18 19.5 18H4.5C3.7 18 3 17.3 3 16.5V7.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9H21M8 15H8.01M12 15H15" />
  </svg>
);

const CreditCardIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5C3 6.7 3.7 6 4.5 6H19.5C20.3 6 21 6.7 21 7.5V16.5C21 17.3 20.3 18 19.5 18H4.5C3.7 18 3 17.3 3 16.5V7.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10H21M7 14H11" />
  </svg>
);

const PayIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12H19M19 12L15 8M19 12L15 16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6L18 18M18 6L6 18" />
  </svg>
);

const EmptyIcon = () => (
  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5C4 6.7 4.7 6 5.5 6H18.5C19.3 6 20 6.7 20 7.5V16.5C20 17.3 19.3 18 18.5 18H5.5C4.7 18 4 17.3 4 16.5V7.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 10H20M8 14H12" />
  </svg>
);

const SuccessIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5L9.5 17L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8V12M12 16H12.01M21 12C21 17 17 21 12 21C7 21 3 17 3 12C3 7 7 3 12 3C17 3 21 7 21 12Z" />
  </svg>
);

/* ===================== TOAST ===================== */

function Toast({ toast, onClose }) {
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
          <p className="text-sm font-black">{success ? "Success" : "Error"}</p>
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

/* ===================== COMPONENT ===================== */

export default function PatientBilling() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [toast, setToast] = useState(null);
  const [payingBill, setPayingBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CARD");

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const fetchBills = async () => {
    try {
      setLoading(true);

      const res = await api.get("/billing/my");
      setBills(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("error", "Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (bill) => {
    setPayingBill(bill);
    setPaymentMethod("CARD");
  };

  const closePaymentModal = () => {
    if (paying) return;
    setPayingBill(null);
  };

  const handlePay = async () => {
    if (!payingBill) return;

    try {
      setPaying(true);

      await api.put(`/billing/${payingBill.id}/pay`, {
        payment_method: paymentMethod,
      });

      showToast("success", "Payment successful");
      setPayingBill(null);
      await fetchBills();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast("error", typeof detail === "string" ? detail : "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const paidBills = useMemo(() => {
    return bills.filter((bill) => bill.status === "PAID").length;
  }, [bills]);

  const unpaidBills = useMemo(() => {
    return bills.filter((bill) => bill.status !== "PAID").length;
  }, [bills]);

  const totalAmount = useMemo(() => {
    return bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  }, [bills]);

  const pendingAmount = useMemo(() => {
    return bills
      .filter((bill) => bill.status !== "PAID")
      .reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  }, [bills]);

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  const formatIST = (dateStr) => {
    if (!dateStr) return { date: "N/A", time: "N/A" };

    const date = dateStr.includes("+") || dateStr.includes("Z")
      ? new Date(dateStr)
      : new Date(`${dateStr}Z`);

    if (Number.isNaN(date.getTime())) {
      return { date: "N/A", time: "N/A" };
    }

    return {
      date: date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }),
    };
  };

  if (loading) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />

        <div className="space-y-6">
          <div className="h-32 animate-pulse rounded-3xl bg-slate-100" />
          <div className="grid gap-4 md:grid-cols-4">
            <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="h-52 animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-52 animate-pulse rounded-3xl bg-slate-100" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Payment Modal */}
      {payingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                  Secure Payment
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Pay Bill #{payingBill.id}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Complete your medical bill payment.
                </p>
              </div>

              <button
                onClick={closePaymentModal}
                className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                aria-label="Close payment modal"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">Amount</span>
                  <span className="text-lg font-black text-slate-950">
                    {formatCurrency(payingBill.amount)}
                  </span>
                </div>

                {payingBill.appointment_id && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">
                      Appointment
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
                      #{payingBill.appointment_id}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="CARD">Card</option>
                  <option value="CASH">Cash</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row">
              <button
                onClick={closePaymentModal}
                disabled={paying}
                className="flex-1 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handlePay}
                disabled={paying}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                <PayIcon />
                {paying ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="relative p-6">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-100 blur-3xl" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <MoneyIcon />
                </div>

                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-blue-600">
                    Patient Billing
                  </p>
                  <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                    My Bills
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    View your medical bills, appointment details, and payment status.
                  </p>
                </div>
              </div>

              <button
                onClick={fetchBills}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
              >
                Refresh Bills
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Total Bills</p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {bills.length}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Paid</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">
              {paidBills}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Unpaid</p>
            <p className="mt-2 text-3xl font-black text-orange-600">
              {unpaidBills}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Pending Amount</p>
            <p className="mt-2 text-xl font-black text-blue-600">
              {formatCurrency(pendingAmount)}
            </p>
          </div>
        </section>

        {/* Bills */}
        {bills.length === 0 ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-emerald-50 text-emerald-600">
              <EmptyIcon />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-950">
              No bills yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
              Your medical bills will appear here after your appointments.
            </p>
          </section>
        ) : (
          <section className="grid gap-5 xl:grid-cols-2">
            {bills.map((bill) => {
              const { date, time } = formatIST(bill.created_at);
              const isPaid = bill.status === "PAID";

              return (
                <article
                  key={bill.id}
                  className={`overflow-hidden rounded-[2rem] border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 ${
                    isPaid ? "border-emerald-200" : "border-orange-200"
                  }`}
                >
                  <div
                    className={`h-1.5 ${
                      isPaid ? "bg-emerald-500" : "bg-orange-500"
                    }`}
                  />

                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        <MoneyIcon />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                              Billing Reference
                            </p>
                            <h3 className="mt-1 text-lg font-black text-slate-950">
                              Bill #{bill.id}
                            </h3>
                          </div>

                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-black ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {bill.status || "UNPAID"}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarIcon />
                            {date}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <ClockIcon />
                            {time}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Corrected Appointment Section */}
                    <div className="mt-5 rounded-3xl bg-slate-50 p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                            Amount
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-950">
                            {formatCurrency(bill.amount)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                            Appointment
                          </p>
                          <p className="mt-1">
                            {bill.appointment_id ? (
                              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
                                #{bill.appointment_id}
                              </span>
                            ) : (
                              <span className="text-sm font-bold text-slate-400">
                                Not linked
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {isPaid && bill.payment_method && (
                        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-slate-600">
                          <CreditCardIcon />
                          Paid via {bill.payment_method}
                        </div>
                      )}
                    </div>

                    {!isPaid && (
                      <button
                        onClick={() => openPaymentModal(bill)}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
                      >
                        <PayIcon />
                        Pay Now
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