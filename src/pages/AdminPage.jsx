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
      <h1 className="mb-1">Bảng quản trị</h1>
      <p className="text-muted mb-4">Quản lý người dùng và thống kê hệ thống</p>

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
