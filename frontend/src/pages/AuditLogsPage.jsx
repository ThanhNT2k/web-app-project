import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon, faClockRotateLeft, faMagnifyingGlass, faRotateRight } from '../lib/icons';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';

const ACTION_LABELS = {
  UPDATE_USER_ROLE: 'Đổi vai trò người dùng',
  UPDATE_USER_STATUS: 'Khóa/mở tài khoản',
  DELETE_COMMENT: 'Xóa bình luận',
  CREATE_BAD_WORD: 'Thêm từ khóa',
  UPDATE_BAD_WORD: 'Cập nhật từ khóa',
  DELETE_BAD_WORD: 'Xóa từ khóa',
  APPROVE_STORY: 'Duyệt truyện',
  PROCESS_STORY: 'Xử lý truyện chờ duyệt',
  UPDATE_COMMENT_STATUS: 'Kiểm duyệt bình luận',
  PROCESS_REPORT: 'Xử lý báo cáo',
  UPDATE_REPORT_STATUS: 'Đổi trạng thái báo cáo',
  PROCESS_PROFILE_AVATAR: 'Xử lý avatar profile',
  TOGGLE_STORY_VISIBILITY: 'Đổi hiển thị truyện',
};

const ENTITY_LABELS = {
  user: 'Người dùng',
  story: 'Truyện',
  report: 'Báo cáo',
  comment: 'Bình luận',
  bad_word: 'Từ khóa',
};

function formatDetails(details) {
  if (!details || typeof details !== 'object' || Object.keys(details).length === 0) return 'Không có dữ liệu bổ sung';
  return Object.entries(details)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
    .join(' · ');
}

function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [filters, setFilters] = useState({ search: '', role: '', action: '', entity_type: '', from: '', to: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const isAdmin = user?.role === 'Admin';
  const actionOptions = useMemo(() => Object.entries(ACTION_LABELS), []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.auditLogs.get({
        page,
        limit: 20,
        ...Object.fromEntries(Object.entries(appliedFilters).filter(([, value]) => value)),
      });
      setLogs(response.logs || []);
      setPagination(response.pagination || { page: 1, totalPages: 1, totalItems: 0 });
    } catch (err) {
      setLogs([]);
      setError(err?.response?.data?.message || 'Không thể tải nhật ký hoạt động.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, [page, appliedFilters]);

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    const empty = { search: '', role: '', action: '', entity_type: '', from: '', to: '' };
    setFilters(empty);
    setAppliedFilters(empty);
    setPage(1);
  };

  return (
    <section className="management-page audit-log-page">
      <header className="management-page-header">
        <div>
          <p className="management-eyebrow">TRUY VẾT HỆ THỐNG</p>
          <h2><FontAwesomeIcon icon={faClockRotateLeft} /> Nhật ký hoạt động</h2>
          <p>{isAdmin ? 'Theo dõi thao tác quản trị và kiểm duyệt trên toàn hệ thống.' : 'Theo dõi các thao tác kiểm duyệt đã thực hiện.'}</p>
        </div>
        <button type="button" onClick={loadLogs} disabled={loading}>
          <FontAwesomeIcon icon={faRotateRight} /> {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </header>

      <section className="management-data-panel audit-log-panel">
        <form className="audit-log-filters" onSubmit={applyFilters}>
          <label className="audit-log-search">
            <span>Tìm kiếm</span>
            <div><FontAwesomeIcon icon={faMagnifyingGlass} /><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Người thực hiện, mã đối tượng, nội dung..." /></div>
          </label>
          {isAdmin ? (
            <label><span>Vai trò</span><select value={filters.role} onChange={(event) => setFilters({ ...filters, role: event.target.value })}><option value="">Tất cả</option><option value="Admin">Admin</option><option value="Moderator">Moderator</option></select></label>
          ) : null}
          <label><span>Hành động</span><select value={filters.action} onChange={(event) => setFilters({ ...filters, action: event.target.value })}><option value="">Tất cả hành động</option>{actionOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label><span>Đối tượng</span><select value={filters.entity_type} onChange={(event) => setFilters({ ...filters, entity_type: event.target.value })}><option value="">Tất cả đối tượng</option>{Object.entries(ENTITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label><span>Từ ngày</span><input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /></label>
          <label><span>Đến ngày</span><input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></label>
          <div className="audit-log-filter-actions"><button type="button" onClick={clearFilters}>Xóa lọc</button><button type="submit">Áp dụng</button></div>
        </form>

        <div className="audit-log-result-summary"><span>Kết quả</span><strong>{pagination.totalItems || 0} bản ghi</strong></div>
        {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}
        {loading ? <div className="management-loading">Đang tải nhật ký...</div> : null}

        {!loading ? (
          <div className="management-table-wrap">
            <table className="management-table audit-log-table">
              <thead><tr><th>Thời gian</th><th>Người thực hiện</th><th>Hành động</th><th>Đối tượng</th><th>Chi tiết</th><th>IP</th></tr></thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td><time>{new Date(log.created_at).toLocaleString('vi-VN')}</time></td>
                    <td><strong>{log.actor_full_name || log.actor_username || `User #${log.actor_id || '?'}`}</strong><span className={`audit-role-badge ${String(log.actor_role).toLowerCase()}`}>{log.actor_role}</span></td>
                    <td><span className="audit-action-badge">{ACTION_LABELS[log.action] || log.action}</span></td>
                    <td>
                      <div className="audit-target-cell">
                        <strong>{ENTITY_LABELS[log.entity_type] || log.entity_type}</strong>
                        {log.entity_id ? <small>#{log.entity_id}</small> : null}
                        {log.affected_user_id || log.affected_username ? (
                          <div className="audit-affected-user">
                            {log.affected_avatar_url ? (
                              <img src={log.affected_avatar_url} alt="" />
                            ) : (
                              <span>{(log.affected_full_name || log.affected_username || 'U').charAt(0).toUpperCase()}</span>
                            )}
                            <div>
                              <em>Người bị ảnh hưởng</em>
                              <b>{log.affected_full_name || log.affected_username || `User #${log.affected_user_id}`}</b>
                              {log.affected_username ? <small>@{log.affected_username}</small> : null}
                            </div>
                          </div>
                        ) : (
                          <span className="audit-no-affected-user">Không xác định người dùng</span>
                        )}
                      </div>
                    </td>
                    <td><p title={formatDetails(log.details)}>{formatDetails(log.details)}</p></td>
                    <td><code>{log.ip_address || '—'}</code></td>
                  </tr>
                ))}
                {!logs.length ? <tr><td colSpan="6" className="management-empty-cell">Chưa có log phù hợp với bộ lọc.</td></tr> : null}
              </tbody>
            </table>
          </div>
        ) : null}

        {pagination.totalPages > 1 ? (
          <nav className="comments-pagination"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Trang trước</button><span>Trang {page} / {pagination.totalPages}</span><button type="button" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((value) => value + 1)}>Trang sau</button></nav>
        ) : null}
      </section>
    </section>
  );
}

export default AuditLogsPage;
