import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}