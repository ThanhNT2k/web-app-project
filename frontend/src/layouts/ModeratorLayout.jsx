import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
            📊 Tổng quan
          </NavLink>

          <NavLink
            to="/moderator/pending-stories"
            className={({ isActive }) =>
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            📖 Duyệt truyện chờ
          </NavLink>

          <NavLink
            to="/moderator/reports"
            className={({ isActive }) => 
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            🚩 Quản lý báo cáo
          </NavLink>

          <NavLink
            to="/moderator/comments"
            className={({ isActive }) => 
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            💬 Quản lý bình luận
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
            🚪 Đăng xuất
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