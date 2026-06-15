import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

function RoleProtectedRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleProtectedRoute;