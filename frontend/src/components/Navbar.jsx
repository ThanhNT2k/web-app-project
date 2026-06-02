import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthModal from './AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [authOpen, setAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/tim-truyen?q=${encodeURIComponent(q)}`);
    setSearchQuery('');
    searchInputRef.current?.blur();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  return (
    <>
      <header className="cmc-site-header">
        <div className="cmc-navbar-inner">
          <Link to="/" className="cmc-logo">
            📚 CMC Truyện
          </Link>

          {/* Search bar */}
          <form className={`cmc-search-form${searchFocused ? ' focused' : ''}`} onSubmit={handleSearch}>
            <span className="cmc-search-icon">🔍</span>
            <input
              ref={searchInputRef}
              type="search"
              className="cmc-search-input"
              placeholder="Tìm truyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                className="cmc-search-clear"
                onClick={handleClearSearch}
                title="Xóa"
              >
                ✕
              </button>
            )}
          </form>

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
              {isDarkMode ? '☀️' : '🌙'}
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
