import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Xử lý đăng xuất
  const handleLogout = async () => {
    await logout();
    navigate('/login'); // Đẩy về trang đăng nhập sau khi thoát
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>CMC Admin</h2>
        </div>

        <nav className="admin-menu">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            📊 Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            👥 Quản lý người dùng
          </NavLink>

          <NavLink
            to="/admin/stories"
            className={({ isActive }) =>
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            📚 Quản lý truyện
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) => 
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            🚩 Quản lý báo cáo
          </NavLink>

          {/* Mục Quản lý từ khóa */}
          <NavLink
            to="/admin/bad-words"
            className={({ isActive }) => 
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            🚫 Quản lý từ khóa
          </NavLink>
        </nav>

        {/* Nút Đăng xuất được đẩy xuống dưới cùng */}
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

export default AdminLayout;