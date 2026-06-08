import { useEffect, useState } from 'react';

import API from '../services/api';

const ROLES = ['Admin', 'Uploader', 'User', 'Guest'];

function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        API.admin.getStats(),
        API.admin.getUsers(),
      ]);
      setStats(statsRes.stats);
      setUsers(usersRes.users || []);
    } catch {
      setMessage('Không tải được dữ liệu admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (userId, role) => {
    try {
      await API.admin.updateUserRole(userId, role);
      setMessage('Đã cập nhật vai trò');
      load();
    } catch {
      setMessage('Cập nhật thất bại');
    }
  };

  return (
    <main className="cmc-main">
            <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 className="mb-1">Admin Dashboard</h1>
          <p className="text-muted">
            Manage your story platform
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <button className="btn-cmc btn-cmc-primary">
            📚 Quản lý truyện
          </button>

          <button className="btn-cmc btn-cmc-secondary">
            👥 Quản lý người dùng
          </button>
        </div>
      </div>
          <div className="panel-card mb-4">
            <h4 className="panel-title">
              🔥 Top Performing Stories
            </h4>

            <p className="text-muted">
              Những truyện có lượt xem và tương tác cao nhất.
            </p>

            <div className="stats-row">
              <div className="stat-box">
                <strong>#1 Phàm Nhân Tu Tiên</strong>
                <span>5.2K lượt xem</span>
              </div>

              <div className="stat-box">
                <strong>#2 Đô Thị Siêu Cấp Thần Y</strong>
                <span>4.8K lượt xem</span>
              </div>

              <div className="stat-box">
                <strong>#3 Kiếm Lai</strong>
                <span>3.9K lượt xem</span>
              </div>
            </div>
          </div>
          <div className="panel-card mb-4">
          <h4 className="panel-title">
            🏆 Top Uploaders
          </h4>

          <div className="stats-row">
            <div className="stat-box">
              <strong>Nguyễn Văn Upload</strong>
              <span>10 truyện</span>
            </div>

            <div className="stat-box">
              <strong>Uploader 02</strong>
              <span>8 truyện</span>
            </div>

            <div className="stat-box">
              <strong>Uploader 03</strong>
              <span>6 truyện</span>
            </div>
          </div>
        </div>
      {message ? <div className="alert-cmc mb-3">{message}</div> : null}

      {loading ? <p>Đang tải...</p> : null}

      {stats ? (
      <div className="stats-row mb-4">
        <div className="stat-box">
          <strong>{stats.users}</strong>
          <span>Người dùng</span>
        </div>

        <div className="stat-box">
          <strong>{stats.stories}</strong>
          <span>Truyện</span>
        </div>

        <div className="stat-box">
          <strong>{stats.chapters}</strong>
          <span>Chương</span>
        </div>

        <div className="stat-box">
          <strong>{stats.comments}</strong>
          <span>Bình luận</span>
        </div>

        <div className="stat-box">
          <strong>12.5K</strong>
          <span>Lượt xem</span>
        </div>

        <div className="stat-box">
          <strong>856</strong>
          <span>Theo dõi</span>
        </div>
      </div>
    ) : null}

      <div className="panel-card">
        <h4 className="panel-title">Người dùng</h4>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.full_name || u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="form-control-cmc form-control-cmc-sm"
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default AdminPage;
