import { NavLink, Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>CMC Admin</h2>
        </div>

        <nav className="admin-menu">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
                isActive
                ? 'admin-menu-item active'
                : 'admin-menu-item'
            }
            >
            📊 Dashboard
            </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
                isActive
                ? 'admin-menu-item active'
                : 'admin-menu-item'
            }
            >
            👥 Quản lý người dùng
            </NavLink>

            <NavLink
            to="/admin/stories"
            className={({ isActive }) =>
                isActive
                ? 'admin-menu-item active'
                : 'admin-menu-item'
            }
            >
            📚 Quản lý truyện
            </NavLink>
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;