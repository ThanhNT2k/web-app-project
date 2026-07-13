import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';

const ROLES = ['Admin', 'Moderator', 'Uploader', 'User'];

function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadUsers = async (searchTerm = search) => {
    try {
      setLoading(true);
      setError('');
      const response = await API.admin.getUsers(searchTerm.trim());
      setUsers(response.users || []);
    } catch (err) {
      console.error('[AdminUsersPage.loadUsers] error', err);
      setError('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(''); }, []);

  const filteredUsers = useMemo(() => (
    roleFilter === 'ALL' ? users : users.filter((user) => user.role === roleFilter)
  ), [users, roleFilter]);

  const counts = useMemo(() => users.reduce((result, user) => ({
    ...result,
    active: result.active + (user.is_active ? 1 : 0),
    locked: result.locked + (user.is_active ? 0 : 1),
    admins: result.admins + (user.role === 'Admin' ? 1 : 0),
  }), { active: 0, locked: 0, admins: 0 }), [users]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 4000);
  };

  const toggleUserStatus = async (user) => {
    if (Number(user.id) === Number(currentUser?.id)) return alert('Bạn không thể khóa tài khoản của chính mình.');
    const nextStatus = !user.is_active;
    const action = nextStatus ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Xác nhận ${action} tài khoản “${user.username}”?`)) return;
    try {
      setProcessingId(user.id);
      await API.admin.updateUserStatus(user.id, nextStatus);
      showMessage(`Đã ${action} tài khoản thành công.`);
      await loadUsers();
    } catch (err) {
      alert(err?.response?.data?.message || `Không thể ${action} tài khoản.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = async (user, role) => {
    if (Number(user.id) === Number(currentUser?.id)) return alert('Bạn không thể tự thay đổi vai trò.');
    if (!window.confirm(`Đổi vai trò của “${user.username}” thành ${role}?`)) return;
    try {
      setProcessingId(user.id);
      await API.admin.updateUserRole(user.id, role);
      showMessage(`Đã cập nhật vai trò thành ${role}.`);
      await loadUsers();
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể thay đổi vai trò.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="management-page">
      <header className="management-page-header">
        <div><p className="management-eyebrow">TÀI KHOẢN & PHÂN QUYỀN</p><h2>Quản lý người dùng</h2><p>Tìm kiếm, phân quyền và kiểm soát trạng thái tài khoản.</p></div>
        <button type="button" onClick={() => loadUsers()} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</button>
      </header>

      <div className="management-stats-grid compact">
        <article className="management-stat"><span>Tổng kết quả</span><strong>{users.length}</strong><small>Theo tìm kiếm hiện tại</small></article>
        <article className="management-stat stat-active"><span>Đang hoạt động</span><strong>{counts.active}</strong><small>Tài khoản có thể đăng nhập</small></article>
        <article className="management-stat stat-locked"><span>Đã khóa</span><strong>{counts.locked}</strong><small>Tài khoản đang bị hạn chế</small></article>
        <article className="management-stat stat-admins"><span>Quản trị viên</span><strong>{counts.admins}</strong><small>Tài khoản quyền cao nhất</small></article>
      </div>

      <section className="management-data-panel">
        <div className="management-toolbar">
          <form onSubmit={(event) => { event.preventDefault(); loadUsers(); }} className="management-search-form">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên, email hoặc username..." />
            <button type="submit">Tìm kiếm</button>
            {search ? <button type="button" className="secondary" onClick={() => { setSearch(''); loadUsers(''); }}>Xóa lọc</button> : null}
          </form>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Lọc vai trò">
            <option value="ALL">Tất cả vai trò</option>
            {ROLES.map((role) => <option value={role} key={role}>{role}</option>)}
          </select>
        </div>

        {message ? <div className="alert-cmc">{message}</div> : null}
        {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}

        {loading ? <div className="management-loading">Đang tải danh sách người dùng...</div> : (
          <div className="management-table-wrap">
            <table className="management-table users-table">
              <thead><tr><th>Người dùng</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isSelf = Number(user.id) === Number(currentUser?.id);
                  return (
                    <tr key={user.id}>
                      <td><div className="management-person"><span className="management-person-avatar"><span>{(user.full_name || user.username || '?').charAt(0).toUpperCase()}</span>{user.avatar_url ? <img src={user.avatar_url} alt={`Avatar của ${user.full_name || user.username}`} onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}</span><div><strong>{user.full_name || user.username}</strong><small>@{user.username} · #{user.id}{isSelf ? ' · Bạn' : ''}</small></div></div></td>
                      <td>{user.email}</td>
                      <td>{isSelf ? <span className="management-badge info">{user.role}</span> : <select value={user.role} onChange={(event) => handleRoleChange(user, event.target.value)} disabled={processingId === user.id}>{ROLES.map((role) => <option value={role} key={role}>{role}</option>)}</select>}</td>
                      <td><span className={`management-badge ${user.is_active ? 'success' : 'danger'}`}>{user.is_active ? 'Hoạt động' : 'Đã khóa'}</span></td>
                      <td>{!isSelf ? <button type="button" className={user.is_active ? 'danger-outline' : 'primary-action'} disabled={processingId === user.id} onClick={() => toggleUserStatus(user)}>{processingId === user.id ? 'Đang cập nhật...' : user.is_active ? 'Khóa' : 'Mở khóa'}</button> : <span className="management-muted">Tài khoản hiện tại</span>}</td>
                    </tr>
                  );
                })}
                {!filteredUsers.length ? <tr><td colSpan="5" className="management-empty-cell">Không tìm thấy người dùng phù hợp.</td></tr> : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminUsersPage;
