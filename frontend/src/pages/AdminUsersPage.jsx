import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadUsers = async (searchTerm = '') => {
    try {
      setLoading(true);
      setError('');
      const res = await API.admin.getUsers(searchTerm);
      setUsers(res.users || []);
    } catch {
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers(search);
  };

  const handleClearSearch = () => {
    setSearch('');
    loadUsers('');
  };

  const toggleUserStatus = async (userItem) => {
    if (Number(userItem.id) === Number(currentUser?.id)) {
      alert('Bạn không thể tự khóa/mở khóa tài khoản của chính mình.');
      return;
    }
    const nextStatus = !userItem.is_active;
    const actionText = nextStatus ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản của "${userItem.username}"?`)) {
      return;
    }

    try {
      await API.admin.updateUserStatus(userItem.id, nextStatus);
      setMessage(`Đã ${actionText} tài khoản thành công.`);
      setTimeout(() => setMessage(''), 4000);
      loadUsers(search);
    } catch (err) {
      alert(err?.response?.data?.message || `Không thể ${actionText} tài khoản.`);
    }
  };

  const handleRoleChange = async (userItem, newRole) => {
    if (Number(userItem.id) === Number(currentUser?.id)) {
      alert('Bạn không thể tự thay đổi vai trò của chính mình.');
      return;
    }
    try {
      await API.admin.updateUserRole(userItem.id, newRole);
      setMessage(`Đã thay đổi vai trò của "${userItem.username}" thành ${newRole}.`);
      setTimeout(() => setMessage(''), 4000);
      loadUsers(search);
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể thay đổi vai trò.');
    }
  };

  const roles = ['Admin', 'Uploader', 'User', 'Guest'];

  return (
    <div className="panel-card">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h4 className="panel-title mb-0" style={{ fontSize: '1.4rem' }}>
          Quản lý người dùng
        </h4>
        <form onSubmit={handleSearchSubmit} className="d-flex gap-2 align-items-center" style={{ maxWidth: '400px', flex: 1 }}>
          <input
            type="text"
            className="form-control-cmc form-control-cmc-sm"
            placeholder="Tìm theo tên, email, username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-cmc btn-cmc-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
            Tìm kiếm
          </button>
          {search && (
            <button
              type="button"
              className="btn-cmc btn-cmc-outline btn-sm"
              onClick={handleClearSearch}
              style={{ whiteSpace: 'nowrap' }}
            >
              Xóa lọc
            </button>
          )}
        </form>
      </div>

      {message && <div className="alert-cmc mb-3">{message}</div>}
      {error && <div className="alert-cmc alert-cmc-warning mb-3">{error}</div>}

      {loading ? (
        <p className="text-muted">Đang tải danh sách người dùng...</p>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = Number(u.id) === Number(currentUser?.id);
                  return (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt=""
                              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: 'rgba(60, 106, 211, 0.15)',
                                color: 'var(--primary-color)',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.85rem',
                              }}
                            >
                              {(u.full_name || u.username || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.full_name || u.username}</div>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        {isSelf ? (
                          <span className="badge-role">{u.role}</span>
                        ) : (
                          <select
                            className="form-control-cmc form-control-cmc-sm"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            style={{ width: 'auto', padding: '4px 8px' }}
                          >
                            {roles.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: u.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: u.is_active ? '#10b981' : '#ef4444',
                          }}
                        >
                          {u.is_active ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {!isSelf && (
                          <button
                            type="button"
                            className={`btn-cmc btn-xs ${u.is_active ? 'btn-link-danger' : 'btn-cmc-primary'}`}
                            onClick={() => toggleUserStatus(u)}
                          >
                            {u.is_active ? 'Khóa' : 'Mở khóa'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;