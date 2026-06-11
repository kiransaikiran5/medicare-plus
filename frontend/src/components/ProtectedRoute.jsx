import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  // Show a spinner while checking authentication status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  // Not logged in – redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but role not allowed – redirect to their default dashboard
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
    if (user.role === 'DOCTOR') return <Navigate to="/doctor-dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;