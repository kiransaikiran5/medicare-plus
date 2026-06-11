import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationsBell from "./NotificationsBell";
import FloatingAIChat from "./FloatingAIChat";

/* ===================== ICONS ===================== */

const SvgIcon = ({ children, className = "h-5 w-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const LogoIcon = () => (
  <SvgIcon className="h-6 w-6">
    <path d="M12 3.5L4.5 7.5V16.5L12 20.5L19.5 16.5V7.5L12 3.5Z" />
    <path d="M8.5 12H15.5M12 8.5V15.5" />
  </SvgIcon>
);

const DashboardIcon = () => (
  <SvgIcon>
    <path d="M4 5.5C4 4.7 4.7 4 5.5 4H9.5C10.3 4 11 4.7 11 5.5V9.5C11 10.3 10.3 11 9.5 11H5.5C4.7 11 4 10.3 4 9.5V5.5Z" />
    <path d="M13 5.5C13 4.7 13.7 4 14.5 4H18.5C19.3 4 20 4.7 20 5.5V9.5C20 10.3 19.3 11 18.5 11H14.5C13.7 11 13 10.3 13 9.5V5.5Z" />
    <path d="M4 14.5C4 13.7 4.7 13 5.5 13H9.5C10.3 13 11 13.7 11 14.5V18.5C11 19.3 10.3 20 9.5 20H5.5C4.7 20 4 19.3 4 18.5V14.5Z" />
    <path d="M13 14.5C13 13.7 13.7 13 14.5 13H18.5C19.3 13 20 13.7 20 14.5V18.5C20 19.3 19.3 20 18.5 20H14.5C13.7 20 13 19.3 13 18.5V14.5Z" />
  </SvgIcon>
);

const UserIcon = () => (
  <SvgIcon>
    <path d="M12 12.5C14.2 12.5 16 10.7 16 8.5C16 6.3 14.2 4.5 12 4.5C9.8 4.5 8 6.3 8 8.5C8 10.7 9.8 12.5 12 12.5Z" />
    <path d="M5 20C5.9 16.8 8.6 15 12 15C15.4 15 18.1 16.8 19 20" />
  </SvgIcon>
);

const DoctorIcon = () => (
  <SvgIcon>
    <path d="M12 12C14 12 15.6 10.4 15.6 8.4C15.6 6.4 14 4.8 12 4.8C10 4.8 8.4 6.4 8.4 8.4C8.4 10.4 10 12 12 12Z" />
    <path d="M5 20C5.8 16.9 8.5 15 12 15C15.5 15 18.2 16.9 19 20" />
    <path d="M18 5.5V9.5M16 7.5H20" />
  </SvgIcon>
);

const CalendarIcon = () => (
  <SvgIcon>
    <path d="M7 4V7M17 4V7" />
    <path d="M5.5 6H18.5C19.3 6 20 6.7 20 7.5V18.5C20 19.3 19.3 20 18.5 20H5.5C4.7 20 4 19.3 4 18.5V7.5C4 6.7 4.7 6 5.5 6Z" />
    <path d="M4 10H20M8 14H10M12 14H14M16 14H16.01M8 17H10M12 17H14" />
  </SvgIcon>
);

const BuildingIcon = () => (
  <SvgIcon>
    <path d="M4 20H20M6 20V5.8C6 4.8 6.8 4 7.8 4H16.2C17.2 4 18 4.8 18 5.8V20" />
    <path d="M9 8H10M14 8H15M9 11.5H10M14 11.5H15M9 15H10M14 15H15" />
  </SvgIcon>
);

const MedicalRecordIcon = () => (
  <SvgIcon>
    <path d="M7 3.8H14.5L19 8.3V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V5.8C5 4.7 5.9 3.8 7 3.8Z" />
    <path d="M14.5 3.8V8.3H19" />
    <path d="M9 13H15M12 10V16" />
  </SvgIcon>
);

const PrescriptionIcon = () => (
  <SvgIcon>
    <path d="M8 4H15.5L19 7.5V20H8C6.9 20 6 19.1 6 18V6C6 4.9 6.9 4 8 4Z" />
    <path d="M15.5 4V7.5H19" />
    <path d="M9 11H15M9 14H13" />
    <path d="M14.5 17.5L17 15M14.5 15L17 17.5" />
  </SvgIcon>
);

const LabIcon = () => (
  <SvgIcon>
    <path d="M9 3.5H15" />
    <path d="M10 3.5V9L5.5 17.2C4.7 18.7 5.8 20.5 7.5 20.5H16.5C18.2 20.5 19.3 18.7 18.5 17.2L14 9V3.5" />
    <path d="M8 16H16" />
    <path d="M9 18.2H15" />
  </SvgIcon>
);

const BillingIcon = () => (
  <SvgIcon>
    <path d="M7 4H17C18.1 4 19 4.9 19 6V20L16.5 18.5L14 20L11.5 18.5L9 20L6.5 18.5L5 19.4V6C5 4.9 5.9 4 7 4Z" />
    <path d="M9 8H15M9 12H15M9 16H12" />
  </SvgIcon>
);

const InsuranceIcon = () => (
  <SvgIcon>
    <path d="M12 3.5L19 6.5V11C19 15.7 16.1 19.1 12 20.5C7.9 19.1 5 15.7 5 11V6.5L12 3.5Z" />
    <path d="M9 12L11 14L15.5 9.5" />
  </SvgIcon>
);

const BellIcon = () => (
  <SvgIcon>
    <path d="M18 10C18 6.7 15.7 4.5 12 4.5C8.3 4.5 6 6.7 6 10V13.5L4.8 16.2C4.5 16.9 5 17.5 5.7 17.5H18.3C19 17.5 19.5 16.9 19.2 16.2L18 13.5V10Z" />
    <path d="M10 20C10.4 20.6 11.1 21 12 21C12.9 21 13.6 20.6 14 20" />
  </SvgIcon>
);

const ChatIcon = () => (
  <SvgIcon>
    <path d="M8.5 10.25H8.51M12 10.25H12.01M15.5 10.25H15.51" strokeWidth="2.2" />
    <path d="M4 11.5C4 7.9 7.3 5 12 5C16.7 5 20 7.9 20 11.5C20 15.1 16.7 18 12 18C11.1 18 10.2 17.9 9.4 17.6L5.5 20L6.4 16.4C4.9 15.2 4 13.4 4 11.5Z" />
  </SvgIcon>
);

const AIIcon = () => (
  <SvgIcon>
    <path d="M8 8.5C8 6.6 9.6 5 11.5 5H12.5C14.4 5 16 6.6 16 8.5V13.5C16 15.4 14.4 17 12.5 17H11.5C9.6 17 8 15.4 8 13.5V8.5Z" />
    <path d="M9 10H15M10 13H10.01M14 13H14.01" strokeWidth="2.2" />
    <path d="M12 2.8V5M12 17V20.5M5 11H8M16 11H19" />
  </SvgIcon>
);

const ReviewIcon = () => (
  <SvgIcon>
    <path d="M12 4L14.4 8.9L19.8 9.7L15.9 13.5L16.8 18.8L12 16.3L7.2 18.8L8.1 13.5L4.2 9.7L9.6 8.9L12 4Z" />
  </SvgIcon>
);

const EmergencyIcon = () => (
  <SvgIcon>
    <path d="M12 3.8L21 19H3L12 3.8Z" />
    <path d="M12 9V13M12 16.5H12.01" strokeWidth="2.4" />
  </SvgIcon>
);

const TelemedicineIcon = () => (
  <SvgIcon>
    <path d="M5.5 7H13.5C14.6 7 15.5 7.9 15.5 9V15C15.5 16.1 14.6 17 13.5 17H5.5C4.4 17 3.5 16.1 3.5 15V9C3.5 7.9 4.4 7 5.5 7Z" />
    <path d="M15.5 10L20.5 7.5V16.5L15.5 14" />
  </SvgIcon>
);

const HealthTrackerIcon = () => (
  <SvgIcon>
    <path d="M4 13H8L10 7L14 17L16 13H20" />
    <path d="M12 21C12 21 4.5 16.9 4.5 9.8C4.5 6.9 6.7 4.8 9.2 4.8C10.6 4.8 11.6 5.5 12 6.1C12.4 5.5 13.4 4.8 14.8 4.8C17.3 4.8 19.5 6.9 19.5 9.8C19.5 16.9 12 21 12 21Z" />
  </SvgIcon>
);

const ReminderIcon = () => (
  <SvgIcon>
    <path d="M12 7V12L15 14" />
    <path d="M12 21C16.4 21 20 17.4 20 13C20 8.6 16.4 5 12 5C7.6 5 4 8.6 4 13C4 17.4 7.6 21 12 21Z" />
    <path d="M7 3L4.5 5.5M17 3L19.5 5.5" />
  </SvgIcon>
);

const ReportsIcon = () => (
  <SvgIcon>
    <path d="M5 20V4H19V20H5Z" />
    <path d="M8 16V12M12 16V8M16 16V10" />
  </SvgIcon>
);

const AuditIcon = () => (
  <SvgIcon>
    <path d="M12 3.5L19 6.5V11C19 15.6 16.2 19.2 12 20.5C7.8 19.2 5 15.6 5 11V6.5L12 3.5Z" />
    <path d="M9 11.5L11 13.5L15.5 9" />
    <path d="M9 16H15" />
  </SvgIcon>
);

const SearchIcon = () => (
  <SvgIcon>
    <path d="M11 18C14.9 18 18 14.9 18 11C18 7.1 14.9 4 11 4C7.1 4 4 7.1 4 11C4 14.9 7.1 18 11 18Z" />
    <path d="M16.5 16.5L20 20" />
  </SvgIcon>
);

const MenuIcon = () => (
  <SvgIcon className="h-6 w-6">
    <path d="M4 7H20M4 12H20M4 17H20" />
  </SvgIcon>
);

const CloseIcon = () => (
  <SvgIcon className="h-6 w-6">
    <path d="M6 6L18 18M18 6L6 18" />
  </SvgIcon>
);

const LogoutIcon = () => (
  <SvgIcon>
    <path d="M15 7V5.5C15 4.7 14.3 4 13.5 4H6.5C5.7 4 5 4.7 5 5.5V18.5C5 19.3 5.7 20 6.5 20H13.5C14.3 20 15 19.3 15 18.5V17" />
    <path d="M12 12H21M18 9L21 12L18 15" />
  </SvgIcon>
);

/* ===================== DATA ===================== */

const iconMap = {
  dashboard: <DashboardIcon />,
  profile: <UserIcon />,
  doctors: <DoctorIcon />,
  calendar: <CalendarIcon />,
  building: <BuildingIcon />,
  records: <MedicalRecordIcon />,
  prescription: <PrescriptionIcon />,
  lab: <LabIcon />,
  billing: <BillingIcon />,
  insurance: <InsuranceIcon />,
  bell: <BellIcon />,
  chat: <ChatIcon />,
  ai: <AIIcon />,
  reviews: <ReviewIcon />,
  emergency: <EmergencyIcon />,
  telemedicine: <TelemedicineIcon />,
  health: <HealthTrackerIcon />,
  reminders: <ReminderIcon />,
  reports: <ReportsIcon />,
  audit: <AuditIcon />,
};

const navLinks = {
  PATIENT: [
    { label: "My Profile", path: "/patient/dashboard", icon: "profile" },
    { label: "Find Doctors", path: "/doctors", icon: "doctors" },
    { label: "My Appointments", path: "/appointments", icon: "calendar" },
    { label: "Book Appointment", path: "/book-appointment", icon: "calendar" },
    { label: "Consultations", path: "/patient/consultations", icon: "chat" },
    { label: "Medical Records", path: "/patient/medical-records", icon: "records" },
    { label: "Prescriptions", path: "/patient/prescriptions", icon: "prescription" },
    { label: "Lab Tests", path: "/patient/lab-tests", icon: "lab" },
    { label: "Billing", path: "/patient/billing", icon: "billing" },
    { label: "Insurance", path: "/patient/insurance", icon: "insurance" },
    { label: "Notifications", path: "/notifications", icon: "bell" },
    { label: "AI Assistant", path: "/ai-assistant", icon: "ai" },
    { label: "Reviews", path: "/patient/reviews", icon: "reviews" },
    { label: "Emergency Contacts", path: "/patient/emergency-contacts", icon: "emergency" },
    { label: "Quick Emergency", path: "/emergency", icon: "emergency" },
    { label: "Telemedicine", path: "/patient/telemedicine", icon: "telemedicine" },
    { label: "Health Tracker", path: "/patient/health-tracker", icon: "health" },
    { label: "Reminders", path: "/patient/reminders", icon: "reminders" },
    { label: "My Admissions", path: "/patient/admissions", icon: "building" },
    { label: "Emergency Requests", path: "/patient/emergency-requests", icon: "bell" },
    { label: "Service Feedback", path: "/patient/service-feedback", icon: "calendar" },
  ],

  DOCTOR: [
    { label: "My Profile", path: "/doctor-dashboard", icon: "profile" },
    { label: "Appointments", path: "/doctor/appointments", icon: "calendar" },
    { label: "My Schedule", path: "/doctor/schedule", icon: "calendar" },
    { label: "Consultations", path: "/doctor/consultations", icon: "chat" },
    { label: "Medical Records", path: "/doctor/medical-records", icon: "records" },
    { label: "Prescriptions", path: "/doctor/prescriptions", icon: "prescription" },
    { label: "Lab Tests", path: "/doctor/lab-tests", icon: "lab" },
    { label: "Billing", path: "/doctor/billing", icon: "billing" },
    { label: "Notifications", path: "/notifications", icon: "bell" },
    { label: "AI Assistant", path: "/ai-assistant", icon: "ai" },
    { label: "Reviews", path: "/doctor/reviews", icon: "reviews" },
    { label: "Emergency", path: "/emergency", icon: "emergency" },
    { label: "Telemedicine", path: "/doctor/telemedicine", icon: "telemedicine" },
    { label: "Bed Availability", 
      path: "/doctor/beds", 
      icon: "building" 
    },
  ],

  ADMIN: [
    { label: "Dashboard", path: "/admin", icon: "dashboard" },
    { label: "Departments", path: "/admin/departments", icon: "building" },
    { label: "Manage Doctors", path: "/admin/doctors", icon: "doctors" },
    { label: "Medical Records", path: "/admin/medical-records", icon: "records" },
    { label: "Lab Tests", path: "/admin/lab-tests", icon: "lab" },
    { label: "Billing", path: "/admin/billing", icon: "billing" },
    { label: "Insurance", path: "/admin/insurance", icon: "insurance" },
    { label: "Notifications", path: "/notifications", icon: "bell" },
    { label: "AI Assistant", path: "/ai-assistant", icon: "ai" },
    { label: "Reviews", path: "/admin/reviews", icon: "reviews" },
    { label: "Emergency", path: "/emergency", icon: "emergency" },
    { label: "Reports", path: "/admin/reports", icon: "reports" },
    { label: "Audit Logs", path: "/admin/audit", icon: "audit" },
    { label: "Telemedicine", path: "/admin/telemedicine", icon: "telemedicine" },
    { label: "Bed Management",
      path: "/admin/beds", 
      icon: "building" 
    },
    { label: "Admissions", path: "/admin/admissions", icon: "building" },
    { label: "Emergency Requests", path: "/admin/emergency-requests", icon: "bell" },
    { label: "Feedback Analytics", path: "/admin/feedback-analytics", icon: "calendar" },
  ],
};

const roleTheme = {
  PATIENT: {
    label: "Patient",
    gradient: "from-blue-600 to-cyan-500",
    activeBg: "bg-blue-50",
    activeText: "text-blue-700",
    roleBg: "bg-blue-100",
    roleText: "text-blue-700",
  },
  DOCTOR: {
    label: "Doctor",
    gradient: "from-emerald-600 to-teal-500",
    activeBg: "bg-emerald-50",
    activeText: "text-emerald-700",
    roleBg: "bg-emerald-100",
    roleText: "text-emerald-700",
  },
  ADMIN: {
    label: "Admin",
    gradient: "from-indigo-600 to-violet-500",
    activeBg: "bg-indigo-50",
    activeText: "text-indigo-700",
    roleBg: "bg-indigo-100",
    roleText: "text-indigo-700",
  },
};

/* ===================== MAIN LAYOUT ===================== */

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const rawRole = user?.role?.value || user?.role || "PATIENT";
  const role = String(rawRole).toUpperCase();

  const links = navLinks[role] || navLinks.PATIENT;
  const theme = roleTheme[role] || roleTheme.PATIENT;

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "user@medicare.com";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const currentPage =
    links.find((item) => isActive(item.path))?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-40 h-full w-[248px]
          border-r border-slate-200 bg-white shadow-xl shadow-slate-200/60
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} text-white shadow-md`}
            >
              <LogoIcon />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-black tracking-tight text-slate-950">
                MediCare Plus
              </h2>

              <p className="text-[11px] font-semibold text-slate-400">
                Healthcare Suite
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
              aria-label="Close sidebar"
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Menu
            </p>

            <div className="space-y-1">
              {links.map((item) => {
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold
                      transition-all duration-200
                      ${
                        active
                          ? `${theme.activeBg} ${theme.activeText}`
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                      }
                    `}
                  >
                    {active && (
                      <span
                        className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b ${theme.gradient}`}
                      />
                    )}

                    <span
                      className={`
                        flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition
                        ${
                          active
                            ? `bg-gradient-to-br ${theme.gradient} text-white shadow-sm`
                            : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-800"
                        }
                      `}
                    >
                      {iconMap[item.icon] || <DashboardIcon />}
                    </span>

                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-slate-100 p-3">
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} text-sm font-black text-white`}
              >
                {userInitial}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black capitalize text-slate-900">
                  {displayName}
                </p>

                <p className="truncate text-[11px] font-medium text-slate-500">
                  {email}
                </p>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between px-1">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-black ${theme.roleBg} ${theme.roleText}`}
              >
                {theme.label}
              </span>

              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Online
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-600 hover:text-white"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-xl md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl bg-slate-100 p-2.5 text-slate-700 transition hover:bg-slate-200 lg:hidden"
                aria-label="Open sidebar"
              >
                <MenuIcon />
              </button>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-black tracking-tight text-slate-950">
                  {currentPage}
                </h1>

                <p className="truncate text-xs font-medium text-slate-500">
                  Welcome back, manage your healthcare workspace.
                </p>
              </div>
            </div>

            <div className="hidden w-full max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500 shadow-sm lg:flex">
              <SearchIcon />

              <input
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search..."
              />

              <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-black text-slate-400 ring-1 ring-slate-200">
                /
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`hidden items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black ring-1 sm:inline-flex ${theme.roleBg} ${theme.roleText}`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {theme.label}
              </span>

              <NotificationsBell />

              <div className="hidden min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm md:flex">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} text-sm font-black text-white`}
                >
                  {userInitial}
                </div>

                <div className="min-w-0 pr-1">
                  <p className="max-w-[110px] truncate text-xs font-black capitalize text-slate-900">
                    {displayName}
                  </p>

                  <p className="text-[10px] font-bold text-slate-400">
                    {theme.label}
                  </p>
                </div>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-sm font-black text-white shadow-sm md:hidden`}
              >
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <div className="mx-auto max-w-[1440px]">
            <Outlet />
          </div>
        </main>

        <FloatingAIChat />
      </div>
    </div>
  );
}