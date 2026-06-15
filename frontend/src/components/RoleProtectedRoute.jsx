import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RoleProtectedRoute({ allowedRoles = [], children }) {
  // Thêm 'loading' từ AuthContext
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // 1. Nếu hệ thống đang tải thông tin người dùng, hiển thị loading 
  // để tránh việc điều hướng nhầm
  if (loading) {
    return <div>Đang xác thực quyền truy cập...</div>;
  }

  // 2. Nếu chưa xác thực xong và không có user, về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Đã có user, kiểm tra role (cẩn thận việc so sánh viết hoa/thường)
  const userRole = user?.role?.toLowerCase();
  const allowed = allowedRoles.map(r => r.toLowerCase());

  if (allowedRoles.length > 0 && !allowed.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleProtectedRoute;