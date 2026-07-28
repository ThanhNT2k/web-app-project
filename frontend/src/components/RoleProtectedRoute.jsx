import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RoleProtectedRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Đang xác thực quyền truy cập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  const userRole = user?.role?.toLowerCase();
  const allowed = allowedRoles.map(r => r.toLowerCase());

  if (allowedRoles.length > 0 && !allowed.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleProtectedRoute;