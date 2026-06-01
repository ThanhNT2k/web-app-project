import { Link } from 'react-router-dom';

import ReadingPreferencesPanel from '../components/ReadingPreferencesPanel';
import { useAuth } from '../contexts/AuthContext';

function AccountPage() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <main className="cmc-main">
        <div className="panel-card text-center py-5">
          <h2>Tài khoản</h2>
          <p className="text-muted mb-4">Đăng nhập hoặc đăng ký để lưu tiến độ và cài đặt đọc.</p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Link to="/login" className="btn-cmc btn-cmc-primary">Đăng nhập</Link>
            <Link to="/register" className="btn-cmc btn-cmc-outline">Đăng ký</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cmc-main">
      <h1 className="mb-1">Tài khoản</h1>
      <p className="text-muted mb-4">
        {user?.full_name || user?.username}
        {' · '}
        {user?.email}
        {' · '}
        <span className="badge-role">{user?.role}</span>
      </p>

      <div className="row g-4">
        <div className="col-lg-6">
          <ReadingPreferencesPanel />
        </div>
        <div className="col-lg-6">
          <div className="panel-card">
            <h5 className="panel-title">Liên kết nhanh</h5>
            <ul className="quick-links">
              <li><Link to="/profile">Hồ sơ & lịch sử đọc</Link></li>
              {(user?.role === 'Uploader' || user?.role === 'Admin') && (
                <li><Link to="/dashboard">Quản lý truyện</Link></li>
              )}
              {user?.role === 'Admin' && (
                <li><Link to="/admin">Bảng quản trị</Link></li>
              )}
            </ul>
            <button type="button" className="btn-cmc btn-cmc-outline mt-3" onClick={logout}>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AccountPage;
