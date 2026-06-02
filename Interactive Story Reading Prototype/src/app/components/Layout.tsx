import { Link, Outlet, useLocation } from 'react-router';
import { Search, Home, Heart, Clock, User, LayoutDashboard, LogOut } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col wireframe-bg">
      <header className="wireframe-header border-b-2 border-gray-400 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 wireframe-logo">
            <div className="w-10 h-10 border-2 border-gray-700 flex items-center justify-center">
              <span className="text-xl font-bold">CMC</span>
            </div>
            <span className="text-xl font-bold">CMC Truyện</span>
          </Link>

          <nav className="flex items-center gap-6">
            {!isAdminRoute ? (
              <>
                <Link to="/" className="wireframe-nav-link">
                  <Home size={20} />
                  <span>Trang Chủ</span>
                </Link>
                <Link to="/search" className="wireframe-nav-link">
                  <Search size={20} />
                  <span>Tìm Kiếm</span>
                </Link>
                <Link to="/favorites" className="wireframe-nav-link">
                  <Heart size={20} />
                  <span>Yêu Thích</span>
                </Link>
                <Link to="/history" className="wireframe-nav-link">
                  <Clock size={20} />
                  <span>Lịch Sử</span>
                </Link>
                <Link to="/profile" className="wireframe-nav-link">
                  <User size={20} />
                  <span>Trang Cá Nhân</span>
                </Link>
                <div className="border-l-2 border-gray-400 h-6 mx-2" />
                <Link to="/admin" className="wireframe-nav-link">
                  <LayoutDashboard size={20} />
                  <span>Quản Trị</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/admin" className="wireframe-nav-link">
                  <LayoutDashboard size={20} />
                  <span>Bảng Điều Khiển</span>
                </Link>
                <Link to="/admin/stories" className="wireframe-nav-link">
                  <span>Quản Lý Truyện</span>
                </Link>
                <Link to="/admin/add-story" className="wireframe-nav-link">
                  <span>Thêm Truyện</span>
                </Link>
                <div className="border-l-2 border-gray-400 h-6 mx-2" />
                <Link to="/" className="wireframe-nav-link">
                  <LogOut size={20} />
                  <span>Thoát Quản Trị</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <Outlet />
      </main>

      <footer className="wireframe-footer border-t-2 border-gray-400 p-4 text-center">
        <p className="text-sm">© 2026 CMC Truyện - Nền Tảng Đọc Truyện Trực Tuyến</p>
      </footer>
    </div>
  );
}
