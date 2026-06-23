import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthModal from './AuthModal';
import NotificationBell from './NotificationBell';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [authOpen, setAuthOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <>
      <header className="cmc-site-header">
        <div className="cmc-navbar-inner">

          <Link to="/" className="cmc-logo">
            📚 CMC Truyện
          </Link>

          <nav className="cmc-nav-links">
            <Link to="/" className="cmc-nav-link">
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Trang chủ</span>
            </Link>

            <Link to="/tim-truyen" className="cmc-nav-link">
              <span className="nav-icon">🔍</span>
              <span className="nav-text">Tìm truyện</span>
            </Link>

            <Link to="/bang-xep-hang" className="cmc-nav-link">
              <span className="nav-icon">🏆</span>
              <span className="nav-text">Bảng xếp hạng</span>
            </Link>

            {isAuthenticated && (
              <Link to="/profile" className="cmc-nav-link">
                <span className="nav-icon">📚</span>
                <span className="nav-text">Tủ sách</span>
              </Link>
            )}
          </nav>

          <div className="cmc-nav-actions" style={{ position: 'relative' }}>
            <NotificationBell />
            <button
              type="button"
              className="btn-theme-toggle"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Bật sáng' : 'Bật tối'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {isAuthenticated ? (
              <div className="nav-profile-dropdown-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="nav-profile-trigger"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="rounded-circle"
                      style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold bg-brand"
                      style={{ width: '28px', height: '28px', fontSize: '0.8rem', minWidth: '28px' }}
                    >
                      {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="nav-username d-none d-md-inline" style={{ maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.full_name || user?.username}
                  </span>
                  <span className="nav-caret">▼</span>
                </button>

                {dropdownOpen && (
                  <div className="nav-profile-dropdown-menu">
                    <div className="px-3 py-2 border-bottom mb-2">
                      <div className="fw-semibold text-truncate" style={{ color: 'var(--text)' }}>
                        {user?.full_name || user?.username}
                      </div>
                      <div className="small text-muted text-truncate" style={{ fontSize: '0.8rem' }}>{user?.email}</div>
                      <span className="badge text-bg-primary mt-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>{user?.role}</span>
                    </div>

                    <Link
                      to="/profile"
                      className="dropdown-item-cmc"
                      onClick={() => setDropdownOpen(false)}
                    >
                      📚 Tủ sách & Hồ sơ
                    </Link>

                    <Link
                      to="/account"
                      className="dropdown-item-cmc"
                      onClick={() => setDropdownOpen(false)}
                    >
                      ⚙️ Cài đặt tài khoản
                    </Link>
                    {user?.role === 'Uploader' && (
                      <Link
                        to="/dashboard"
                        className="dropdown-item-cmc"
                        onClick={() => setDropdownOpen(false)}
                      >
                        ✍️ Quản lý truyện
                      </Link>
                    )}

                    {user?.role === 'Admin' && (
                      <Link
                        to="/admin"
                        className="dropdown-item-cmc"
                        onClick={() => setDropdownOpen(false)}
                      >
                        🛡️ Hệ thống Admin
                      </Link>
                    )}
                    {user?.role === 'Moderator' && (
                      <Link
                        to="/moderator/dashboard"
                        className="dropdown-item-cmc"
                        onClick={() => setDropdownOpen(false)}
                      >
                        🛡️ Hệ thống Moderator
                      </Link>
                    )}

                    <div className="dropdown-divider border-top my-2"></div>

                    <button
                      type="button"
                      className="dropdown-item-cmc btn-logout-cmc"
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                    >
                      🚪 Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" className="btn-cmc btn-cmc-primary btn-sm" onClick={() => setAuthOpen(true)}>
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
