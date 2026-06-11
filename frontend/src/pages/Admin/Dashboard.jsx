import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

/* ===== Inline SVG Icons ===== */
const PatientsIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const DoctorsIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 8.7 9.7 8 10.563 8h.874c.863 0 1.563.7 1.563 1.563V12m0 0v1.5m0-1.5h-1.5M12 19.5V21m-3-3h6" />
  </svg>
);

const AppointmentsIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const RevenueIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
);

const ConsultationsIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
  </svg>
);

const AdmissionIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const StarIcon = ({ className = 'h-5 w-5 text-yellow-400' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

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

export default function AdminDashboard() {
  const [basicStats, setBasicStats] = useState(null);
  const [advancedStats, setAdvancedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [basicRes, advancedRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/advanced-stats'),
        ]);
        setBasicStats(basicRes.data);
        setAdvancedStats(advancedRes.data);
      } catch (err) {
        setToast({ message: 'Failed to load dashboard data', type: 'error' });
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

  // Chart data
  const deptChartData = advancedStats ? {
    labels: advancedStats.department_performance.map(d => d.department_name),
    datasets: [
      {
        label: 'Appointments',
        data: advancedStats.department_performance.map(d => d.appointments_count),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Consultations',
        data: advancedStats.department_performance.map(d => d.consultations_count),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  } : null;

  const revenuePieData = advancedStats ? {
    labels: ['Paid', 'Unpaid'],
    datasets: [
      {
        data: [advancedStats.paid_revenue, advancedStats.unpaid_revenue],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  } : null;

  const satisfactionDoughnutData = advancedStats ? {
    labels: ['Satisfaction', 'Remaining'],
    datasets: [
      {
        data: [
          advancedStats.patient_satisfaction.average_service_feedback || 0,
          5 - (advancedStats.patient_satisfaction.average_service_feedback || 0),
        ],
        backgroundColor: ['rgba(59, 130, 246, 0.9)', 'rgba(229, 231, 235, 0.6)'],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
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
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading dashboard...</p>
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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Advanced Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Comprehensive overview of hospital operations</p>
      </div>

      {/* Basic Summary Cards */}
      {basicStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard title="Total Patients" value={basicStats.total_patients} icon={<PatientsIcon />} color="blue" />
          <StatCard title="Total Doctors" value={basicStats.total_doctors} icon={<DoctorsIcon />} color="emerald" />
          <StatCard title="Total Appointments" value={basicStats.total_appointments} icon={<AppointmentsIcon />} color="purple" />
          <StatCard title="Total Revenue" value={`₹${basicStats.total_revenue.toFixed(2)}`} icon={<RevenueIcon />} color="amber" />
        </div>
      )}

      {/* Advanced Stats Cards */}
      {advancedStats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard title="Total Consultations" value={advancedStats.total_consultations} icon={<ConsultationsIcon />} color="indigo" />
            <StatCard title="Total Admissions" value={advancedStats.total_admissions} icon={<AdmissionIcon />} color="teal" />
            <StatCard title="Paid Revenue" value={`₹${advancedStats.paid_revenue.toFixed(2)}`} icon={<RevenueIcon />} color="emerald" />
            <StatCard title="Unpaid Revenue" value={`₹${advancedStats.unpaid_revenue.toFixed(2)}`} icon={<RevenueIcon />} color="rose" />
          </div>

          {/* Patient Satisfaction + Revenue Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Patient Satisfaction</h2>
              <div className="relative w-44 h-44 mt-2 mb-4">
                <Doughnut data={satisfactionDoughnutData} options={{ ...chartOptions, cutout: '75%' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900">
                      {advancedStats.patient_satisfaction.average_service_feedback?.toFixed(1) || 'N/A'}
                    </p>
                    <p className="text-sm text-slate-500">out of 5</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400">Service feedback rating</p>
            </div>

            {revenuePieData && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Revenue Breakdown</h2>
                <div className="h-56">
                  <Pie data={revenuePieData} options={{ ...chartOptions, cutout: '60%' }} />
                </div>
              </div>
            )}
          </div>

          {/* Department Performance Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Department Performance</h2>
            <p className="text-sm text-slate-500 mb-6">Appointments & consultations per department</p>
            {deptChartData ? (
              <div className="h-72">
                <Bar data={deptChartData} options={{ ...chartOptions, plugins: { legend: { display: true, position: 'bottom' } } }} />
              </div>
            ) : (
              <p className="text-slate-500">No department data available.</p>
            )}
          </div>

          {/* Doctor Performance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Doctor Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialization</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointments</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Consultations</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {advancedStats.doctor_performance.map(doc => (
                    <tr key={doc.doctor_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900">{doc.doctor_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{doc.specialization}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{doc.appointments_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{doc.consultations_completed}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{doc.average_rating ? doc.average_rating.toFixed(1) : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">₹{doc.total_revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                  {advancedStats.doctor_performance.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-slate-500">No doctor data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ===== Reusable Stat Card ===== */
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    purple: 'bg-purple-50 border-purple-200',
    amber: 'bg-amber-50 border-amber-200',
    indigo: 'bg-indigo-50 border-indigo-200',
    teal: 'bg-teal-50 border-teal-200',
    rose: 'bg-rose-50 border-rose-200',
  };

  const iconColor = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    indigo: 'text-indigo-600',
    teal: 'text-teal-600',
    rose: 'text-rose-600',
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color] || 'bg-gray-50 border-gray-200'}`}>
          <span className={iconColor[color] || 'text-gray-600'}>{icon}</span>
        </div>
      </div>
    </div>
  );
}