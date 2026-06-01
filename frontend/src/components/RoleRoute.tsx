import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

export default function RoleRoute({ roles }: { roles: Array<'Admin' | 'Uploader' | 'User' | 'Guest' | string> }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}