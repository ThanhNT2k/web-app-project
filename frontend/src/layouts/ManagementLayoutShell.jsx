import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import {
  FontAwesomeIcon,
  faBars,
  faRightFromBracket,
  faShieldHalved,
  faXmark,
} from '../lib/icons';

function ManagementLayoutShell({ brand, roleLabel, navItems, accent = 'blue' }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const activeItem = navItems.find((item) => item.to === location.pathname)
    || navItems.find((item) => location.pathname.startsWith(`${item.to}/`))
    || navItems[0];
  const displayName = user?.full_name || user?.username || roleLabel;
  const avatarLetter = displayName.trim().charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={`admin-layout admin-layout-${accent}`}>
      <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="admin-brand">
          <span className="admin-brand-mark"><FontAwesomeIcon icon={faShieldHalved} /></span>
          <div>
            <small>CMC TRUYỆN</small>
            <strong>{brand}</strong>
          </div>
          <button type="button" className="admin-sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Đóng menu">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <p className="admin-menu-label">ĐIỀU HƯỚNG</p>
        <nav className="admin-menu" aria-label={`Điều hướng ${roleLabel}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? 'admin-menu-item active' : 'admin-menu-item'}
            >
              <span className="admin-menu-icon"><FontAwesomeIcon icon={item.icon} /></span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-summary">
            <span className="admin-user-avatar">{avatarLetter}</span>
            <div>
              <strong>{displayName}</strong>
              <small>{roleLabel}</small>
            </div>
          </div>
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {menuOpen ? <button type="button" className="admin-sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Đóng menu" /> : null}

      <div className="admin-shell">
        <header className="admin-topbar">
          <button type="button" className="admin-mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Mở menu">
            <FontAwesomeIcon icon={faBars} />
          </button>
          <div className="admin-topbar-title">
            <small>Không gian {roleLabel.toLowerCase()}</small>
            <strong>{activeItem.label}</strong>
          </div>
          <span className="admin-role-chip">
            <FontAwesomeIcon icon={faShieldHalved} />
            {roleLabel}
          </span>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ManagementLayoutShell;
