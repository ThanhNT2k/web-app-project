import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FontAwesomeIcon,
  faBookOpen,
  faComments,
  faFlag,
  faGaugeHigh,
  faRightFromBracket,
} from '../lib/icons';

function ModeratorLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar - Cấu trúc giống hệt AdminLayout */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>CMC Moderator</h2>
        </div>

        <nav className="admin-menu">
          <NavLink
            to="/moderator/dashboard"
            className={({ isActive }) =>
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            <FontAwesomeIcon icon={faGaugeHigh} />
            <span>Tổng quan</span>
          </NavLink>

          <NavLink
            to="/moderator/pending-stories"
            className={({ isActive }) =>
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            <FontAwesomeIcon icon={faBookOpen} />
            <span>Duyệt truyện chờ</span>
          </NavLink>

          <NavLink
            to="/moderator/reports"
            className={({ isActive }) => 
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            <FontAwesomeIcon icon={faFlag} />
            <span>Quản lý báo cáo</span>
          </NavLink>

          <NavLink
            to="/moderator/comments"
            className={({ isActive }) => 
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            <FontAwesomeIcon icon={faComments} />
            <span>Quản lý bình luận</span>
          </NavLink>
        </nav>

        {/* Nút Đăng xuất đồng bộ phong cách */}
        <div className="mt-auto pt-4 w-100">
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default ModeratorLayout;
