import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Giả sử bạn dùng AuthContext

function ModeratorLayout() {
  const { user } = useAuth();
  const location = useLocation();

  // Hàm kiểm tra active menu
  const isActive = (path) => location.pathname.includes(path) ? 'active' : '';

  return (
    <div className="admin-layout">
      {/* Cột Menu Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>CMC Truyện</h2>
          <span className="badge-role mt-2 d-inline-block">Moderator</span>
        </div>

        <nav className="admin-menu">
          <Link to="/moderator/dashboard" className={`admin-menu-item ${isActive('/dashboard')}`}>
            📊 Tổng quan
          </Link>
          <Link to="/moderator/pending-stories" className={`admin-menu-item ${isActive('/pending-stories')}`}>
            📖 Duyệt truyện chờ
          </Link>
          <Link to="/moderator/reports" className={`admin-menu-item ${isActive('/reports')}`}>
            🚩 Xử lý Report / Spam
          </Link>
          <Link to="/moderator/comments" className={`admin-menu-item ${isActive('/comments')}`}>
            💬 Quản lý bình luận
          </Link>
        </nav>

        <div className="mt-auto pt-4">
          <div className="text-sm text-center mb-3 text-muted">
            Xin chào, {user?.username || 'Mod'}
          </div>
          <Link to="/" className="admin-menu-item text-center" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            ← Về trang chủ
          </Link>
        </div>
      </aside>

      {/* Khu vực nội dung thay đổi theo Route */}
      <main className="admin-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="section-title mb-0">Khu vực Kiểm duyệt</h1>
        </div>
        
        {/* Component con sẽ được render ở đây (ví dụ: PendingStories, ReportsList...) */}
        <Outlet />
      </main>
    </div>
  );
}

export default ModeratorLayout;