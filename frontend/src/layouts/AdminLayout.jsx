import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FontAwesomeIcon,
  faBan,
  faBookOpen,
  faComments,
  faFlag,
  faGaugeHigh,
  faRightFromBracket,
  faUsers,
} from '../lib/icons';

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
            <FontAwesomeIcon icon={faGaugeHigh} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            <FontAwesomeIcon icon={faUsers} />
            <span>Quản lý người dùng</span>
          </NavLink>

          <NavLink
            to="/admin/stories"
            className={({ isActive }) =>
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            <FontAwesomeIcon icon={faBookOpen} />
            <span>Quản lý truyện</span>
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) => 
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            <FontAwesomeIcon icon={faFlag} />
            <span>Quản lý báo cáo</span>
          </NavLink>

          <NavLink
            to="/admin/comments"
            className={({ isActive }) =>
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            <FontAwesomeIcon icon={faComments} />
            <span>Quản lý bình luận</span>
          </NavLink>

          {/* Mục Quản lý từ khóa */}
          <NavLink
            to="/admin/bad-words"
            className={({ isActive }) => 
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            <FontAwesomeIcon icon={faBan} />
            <span>Quản lý từ khóa</span>
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

export default AdminLayout;
