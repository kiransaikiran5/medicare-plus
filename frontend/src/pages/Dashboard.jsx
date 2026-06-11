import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user?.email}! Your role is <strong>{user?.role}</strong>.</p>
      <p className="mt-2">This is a protected page.</p>
    </div>
  );
}