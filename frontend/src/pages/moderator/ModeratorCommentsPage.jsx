import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import API from '../../services/api';

const STATUS_CONFIG = {
  approved: { label: 'Đã duyệt', description: 'Hiển thị bình thường' },
  masked: { label: 'Đã che nội dung', description: 'Che các từ nhạy cảm' },
  flagged: { label: 'Đã gắn spam', description: 'Cảnh báo nội dung khả nghi' },
  rejected: { label: 'Đã từ chối', description: 'Ẩn khỏi khu vực bình luận' },
};

const FILTERS = ['all', 'approved', 'masked', 'flagged', 'rejected'];

function ModeratorCommentsPage() {
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, masked: 0, flagged: 0, rejected: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [statusFilter, setStatusFilter] = useState('approved');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActions, setSelectedActions] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPagination((current) => ({ ...current, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.moderator.getComments({
        page: pagination.page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
      });
      setComments(response.comments || []);
      setStats(response.stats || { total: 0, approved: 0, masked: 0, flagged: 0, rejected: 0 });
      setPagination((current) => ({
        ...current,
        ...(response.pagination || {}),
      }));
    } catch (err) {
      console.error('[ModeratorCommentsPage.loadComments] error', err);
      setError('Không thể tải danh sách bình luận.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [pagination.page, statusFilter, searchQuery]);

  const changeFilter = (status) => {
    setStatusFilter(status);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const handleActionChange = (commentId, status) => {
    setSelectedActions((current) => ({ ...current, [commentId]: status }));
  };

  const handleApplyAction = async (comment) => {
    const nextStatus = selectedActions[comment.id];
    if (!nextStatus || nextStatus === comment.status) return;

    if (
      (nextStatus === 'rejected' || nextStatus === 'flagged')
      && !window.confirm(`Xác nhận: ${STATUS_CONFIG[nextStatus].description.toLowerCase()}?`)
    ) return;

    try {
      setProcessingId(comment.id);
      await API.moderator.updateCommentStatus(comment.id, nextStatus);
      setSelectedActions((current) => ({ ...current, [comment.id]: '' }));
      await loadComments();
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể cập nhật bình luận.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="comments-workspace">
      <header className="comments-page-header">
        <div>
          <p className="comments-eyebrow">KIỂM DUYỆT CỘNG ĐỒNG</p>
          <h2>Quản lý bình luận</h2>
          <p>Tìm kiếm, phân loại và xử lý nội dung theo mức độ vi phạm.</p>
        </div>
        <button type="button" onClick={loadComments} disabled={loading}>
          {loading ? 'Đang tải...' : 'Làm mới dữ liệu'}
        </button>
      </header>

      <div className="comment-stats-grid">
        {[
          ['total', 'Tổng bình luận'],
          ['approved', 'Đang hiển thị'],
          ['masked', 'Đã che nội dung'],
          ['flagged', 'Đã gắn spam'],
          ['rejected', 'Đã từ chối'],
        ].map(([key, label]) => (
          <div className={`comment-stat-card stat-${key}`} key={key}>
            <span>{label}</span>
            <strong>{stats[key] || 0}</strong>
          </div>
        ))}
      </div>

      <div className="comments-toolbar">
        <label className="comments-search-field">
          <span>Tìm kiếm bình luận</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Nội dung, người dùng hoặc tên truyện..."
          />
        </label>

        <div className="comments-status-filters" role="tablist" aria-label="Lọc trạng thái bình luận">
          {FILTERS.map((status) => (
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === status}
              className={statusFilter === status ? 'active' : ''}
              key={status}
              onClick={() => changeFilter(status)}
            >
              {status === 'all' ? 'Tất cả' : STATUS_CONFIG[status].label}
              <strong>{status === 'all' ? stats.total : stats[status]}</strong>
            </button>
          ))}
        </div>
      </div>

      {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}

      {!loading && comments.length === 0 ? (
        <div className="comments-empty-state">
          <strong>Không tìm thấy bình luận</strong>
          <span>Hãy thử thay đổi từ khóa hoặc bộ lọc trạng thái.</span>
        </div>
      ) : null}

      <div className="moderation-comment-list" aria-busy={loading}>
        {comments.map((comment) => {
          const statusInfo = STATUS_CONFIG[comment.status] || {
            label: comment.status,
            description: 'Trạng thái khác',
          };
          const displayName = comment.user_full_name || comment.user_username || `Người dùng #${comment.user_id}`;
          const selectedStatus = selectedActions[comment.id] || '';
          const isProcessing = processingId === comment.id;

          return (
            <article className="moderation-comment-card" key={comment.id}>
              <div className="moderation-comment-meta">
                <div className="moderation-comment-user">
                  {comment.user_avatar_url ? (
                    <img className="moderation-user-avatar" src={comment.user_avatar_url} alt={`Avatar của ${displayName}`} />
                  ) : (
                    <span>{displayName.trim().charAt(0).toUpperCase()}</span>
                  )}
                  <div>
                    <strong>{displayName}</strong>
                    <small>@{comment.user_username || `user-${comment.user_id}`}</small>
                  </div>
                </div>
                <span className={`moderation-status status-${comment.status}`}>
                  {statusInfo.label}
                </span>
              </div>

              <p className="moderation-comment-content">{comment.content || 'Bình luận không có nội dung.'}</p>

              <dl className="moderation-comment-context">
                <div>
                  <dt>Vị trí</dt>
                  <dd>
                    {comment.story_slug ? (
                      <Link to={`/${comment.story_slug}${comment.chapter_number ? `/${comment.chapter_number}` : ''}`}>
                        {comment.story_title || 'Truyện'}
                        {comment.chapter_number ? ` — Chương ${comment.chapter_number}` : ''}
                      </Link>
                    ) : 'Không xác định'}
                  </dd>
                </div>
                <div>
                  <dt>Thời gian</dt>
                  <dd>{new Date(comment.created_at).toLocaleString('vi-VN')}</dd>
                </div>
                <div>
                  <dt>Mã bình luận</dt>
                  <dd>#{comment.id}{comment.parent_comment_id ? ` · Trả lời #${comment.parent_comment_id}` : ''}</dd>
                </div>
              </dl>

              <div className="moderation-comment-actions">
                <label htmlFor={`comment-action-${comment.id}`}>Phương án xử lý</label>
                <select
                  id={`comment-action-${comment.id}`}
                  value={selectedStatus}
                  onChange={(event) => handleActionChange(comment.id, event.target.value)}
                  disabled={isProcessing}
                >
                  <option value="">Chọn phương án...</option>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <option value={status} key={status} disabled={status === comment.status}>
                      {config.label} — {config.description}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleApplyAction(comment)}
                  disabled={!selectedStatus || selectedStatus === comment.status || isProcessing}
                >
                  {isProcessing ? 'Đang cập nhật...' : 'Áp dụng'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {pagination.totalPages > 1 ? (
        <nav className="comments-pagination" aria-label="Phân trang bình luận">
          <button
            type="button"
            disabled={pagination.page <= 1 || loading}
            onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}
          >
            Trang trước
          </button>
          <span>Trang {pagination.page} / {pagination.totalPages} · {pagination.totalItems} kết quả</span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}
          >
            Trang sau
          </button>
        </nav>
      ) : null}
    </section>
  );
}

export default ModeratorCommentsPage;
