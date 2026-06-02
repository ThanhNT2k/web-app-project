import { Link } from 'react-router';
import { mockUser } from '../data/mockData';
import { User, Mail, Calendar, Heart, Clock, Settings, LogOut } from 'lucide-react';

export default function Profile() {
  return (
    <div className="space-y-6">
      <div className="wireframe-section">
        <h1 className="wireframe-heading">Trang Cá Nhân</h1>
        <p className="wireframe-text mt-2">Quản lý thông tin tài khoản</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="wireframe-card">
          <div className="text-center">
            <div className="wireframe-image-placeholder w-32 h-32 rounded-full mx-auto mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <h2 className="wireframe-card-title">{mockUser.username}</h2>
            <p className="wireframe-text text-sm mt-1">{mockUser.email}</p>
            <div className="flex items-center justify-center gap-2 mt-3 text-sm">
              <Calendar size={14} />
              <span className="wireframe-text text-xs">Tham gia Tháng 5, 2026</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t-2 border-gray-300 space-y-2">
            <button className="wireframe-button-secondary w-full flex items-center justify-center gap-2">
              <Settings size={18} />
              Chỉnh Sửa Hồ Sơ
            </button>
            <Link to="/login" className="wireframe-button-secondary w-full flex items-center justify-center gap-2">
              <LogOut size={18} />
              Đăng Xuất
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="wireframe-card">
            <h2 className="wireframe-section-title mb-4">Thống Kê</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="wireframe-card bg-gray-50 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Heart size={24} />
                </div>
                <p className="text-2xl font-bold">{mockUser.favoriteStories.length}</p>
                <p className="wireframe-text text-sm">Truyện Yêu Thích</p>
              </div>
              <div className="wireframe-card bg-gray-50 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock size={24} />
                </div>
                <p className="text-2xl font-bold">{mockUser.readingHistory.length}</p>
                <p className="wireframe-text text-sm">Truyện Đã Đọc</p>
              </div>
              <div className="wireframe-card bg-gray-50 text-center">
                <div className="flex items-center justify-center mb-2">
                  <User size={24} />
                </div>
                <p className="text-2xl font-bold">15</p>
                <p className="wireframe-text text-sm">Ngày Hoạt Động</p>
              </div>
            </div>
          </div>

          <div className="wireframe-card">
            <h2 className="wireframe-section-title mb-4">Truy Cập Nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link to="/favorites" className="wireframe-list-item hover:bg-gray-200 transition-colors">
                <Heart size={18} />
                <span className="font-bold">Yêu Thích</span>
              </Link>
              <Link to="/history" className="wireframe-list-item hover:bg-gray-200 transition-colors">
                <Clock size={18} />
                <span className="font-bold">Lịch Sử Đọc</span>
              </Link>
              <Link to="/search" className="wireframe-list-item hover:bg-gray-200 transition-colors">
                <span className="font-bold">Tìm Truyện</span>
              </Link>
              <button className="wireframe-list-item hover:bg-gray-200 transition-colors">
                <Settings size={18} />
                <span className="font-bold">Cài Đặt Tài Khoản</span>
              </button>
            </div>
          </div>

          <div className="wireframe-card">
            <h2 className="wireframe-section-title mb-4">Sở Thích Đọc Truyện</h2>
            <div className="space-y-3">
              <div>
                <label className="wireframe-label">Thể Loại Yêu Thích</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Tiên Hiệp', 'Kiếm Hiệp', 'Đô Thị'].map((genre) => (
                    <span key={genre} className="wireframe-badge">
                      {genre}
                    </span>
                  ))}
                  <button className="wireframe-badge border-dashed">+ Thêm Thể Loại</button>
                </div>
              </div>
              <div>
                <label className="wireframe-label">Thông Báo Email</label>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" className="wireframe-checkbox" defaultChecked />
                  <span className="wireframe-text text-sm">Thông báo khi có chương mới</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" className="wireframe-checkbox" />
                  <span className="wireframe-text text-sm">Gửi gợi ý hàng tuần</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
