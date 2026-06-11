import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

/* ===== Inline SVG Icons ===== */
const StarFilledIcon = ({ className = 'h-5 w-5 text-yellow-400' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

/* ===== Category definitions ===== */
const CATEGORIES = [
  { key: 'Cleanliness', label: 'Cleanliness', color: 'bg-blue-100 text-blue-700' },
  { key: 'Staff Courtesy', label: 'Staff Courtesy', color: 'bg-green-100 text-green-700' },
  { key: 'Waiting Time', label: 'Waiting Time', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'Doctor Availability', label: 'Doctor Availability', color: 'bg-purple-100 text-purple-700' },
  { key: 'Facilities', label: 'Facilities', color: 'bg-orange-100 text-orange-700' },
  { key: 'Overall Experience', label: 'Overall Experience', color: 'bg-pink-100 text-pink-700' },
];

/* ===== Toast Component ===== */
function Toast({ message, type, onClose }) {
  if (!message) return null;

  const bg = type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800';
  const Icon = type === 'success' ? (
    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 border rounded-xl shadow-lg flex items-start gap-3 ${bg} animate-slide-in`}>
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

export default function FeedbackAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, feedbacksRes] = await Promise.all([
          api.get('/service-feedback/analytics'),
          api.get('/service-feedback/all'),
        ]);
        setAnalytics(analyticsRes.data);
        setFeedbacks(feedbacksRes.data);
      } catch (err) {
        setToast({ message: 'Failed to load data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const formatIST = (dateStr) => {
    if (!dateStr) return '';
    const date = dateStr.includes('+') || dateStr.includes('Z')
      ? new Date(dateStr)
      : new Date(dateStr + 'Z');
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  };

  // Bar chart data
  const barData = analytics ? {
    labels: Object.keys(analytics.category_ratings),
    datasets: [
      {
        label: 'Average Rating',
        data: Object.values(analytics.category_ratings),
        backgroundColor: [
          'rgba(59, 130, 246, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(139, 92, 246, 0.85)',
          'rgba(249, 115, 22, 0.85)',
          'rgba(236, 72, 153, 0.85)',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 8,
        barPercentage: 0.6,
      },
    ],
  } : null;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: { stepSize: 1, font: { size: 13 } },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      },
    },
  };

  // Doughnut gauge for overall average
  const doughnutData = analytics ? {
    labels: ['Average', 'Remaining'],
    datasets: [
      {
        data: [analytics.average_rating, 5 - analytics.average_rating],
        backgroundColor: ['rgba(59, 130, 246, 0.9)', 'rgba(229, 231, 235, 0.6)'],
        borderWidth: 0,
        cutout: '80%',
      },
    ],
  } : null;

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl px-10 py-8 text-center shadow-2xl">
          <svg className="mx-auto h-10 w-10 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Feedback & Satisfaction Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Patient service feedback overview</p>
      </div>

      {/* Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Total Feedback */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-5">
            <div className="p-3 rounded-xl bg-blue-50">
              <ChartIcon />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Feedback</p>
              <p className="text-3xl font-bold text-slate-900">{analytics.total_feedback}</p>
            </div>
          </div>

          {/* Overall Average with gauge */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-5">
            <div className="p-3 rounded-xl bg-yellow-50">
              <StarFilledIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Overall Average</p>
              <p className="text-3xl font-bold text-slate-900">{analytics.average_rating}<span className="text-lg text-slate-500">/5</span></p>
            </div>
            <div className="w-16 h-16">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>

          {/* Highest Rated Category */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-5">
            <div className="p-3 rounded-xl bg-emerald-50">
              <StarFilledIcon className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Top Category</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {Object.entries(analytics.category_ratings).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </p>
              <p className="text-sm text-slate-500">
                {Object.entries(analytics.category_ratings).sort((a,b) => b[1] - a[1])[0]?.[1]?.toFixed(1)} / 5
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {barData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Bar Chart - takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Rating by Category</h2>
            <p className="text-sm text-slate-500 mb-6">Average ratings across service areas</p>
            <div className="h-72">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* Doughnut Gauge (larger) – 1 column */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center">
            <h2 className="text-lg font-semibold text-slate-800 text-center">Overall Satisfaction</h2>
            <div className="relative w-44 h-44 mt-4 mb-2">
              <Doughnut data={doughnutData} options={{ ...doughnutOptions, cutout: '75%' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{analytics.average_rating}</p>
                  <p className="text-sm text-slate-500">out of 5</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Based on {analytics.total_feedback} reviews</p>
          </div>
        </div>
      )}

      {/* Feedback Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">All Feedback</h2>
        </div>
        {feedbacks.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No feedback yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbacks.map(fb => {
                  const category = CATEGORIES.find(c => c.key === fb.category);
                  const catColor = category ? category.color : 'bg-gray-100 text-gray-700';
                  const catLabel = category ? category.label : fb.category;

                  return (
                    <tr key={fb.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-mono">{fb.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{fb.patient_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${catColor}`}>
                          {catLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{fb.rating}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{fb.comment || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatIST(fb.created_at)}</td>
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