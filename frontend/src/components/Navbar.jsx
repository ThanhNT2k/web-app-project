import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthModal from './AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [authOpen, setAuthOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <header className="cmc-site-header">
        <div className="cmc-navbar-inner">
          <Link to="/" className="cmc-logo">
            📚 CMC Truyện
          </Link>

          <nav className="cmc-nav-links">
            <Link to="/tim-truyen" className="cmc-nav-link">
              Tìm Truyện
            </Link>
          </nav>

          <div className="cmc-nav-actions">
            <button
              type="button"
              className="btn-theme-toggle"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Bật sáng' : 'Bật tối'}
            >
              {isDarkMode ? '☀️ Sáng' : '🌙 Tối'}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/profile" className="cmc-nav-link">Hồ sơ</Link>
                <Link to="/account" className="cmc-nav-link">Tài khoản</Link>
                {(user?.role === 'Uploader' || user?.role === 'Admin') && (
                  <Link to="/dashboard" className="cmc-nav-link">Quản lý</Link>
                )}
                {user?.role === 'Admin' && (
                  <Link to="/admin" className="cmc-nav-link">Admin</Link>
                )}
                <button type="button" className="cmc-nav-link" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <button type="button" className="cmc-nav-link" onClick={() => setAuthOpen(true)}>
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

export default Navbar;
