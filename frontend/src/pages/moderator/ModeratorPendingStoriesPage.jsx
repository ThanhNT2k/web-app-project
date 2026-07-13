import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import API from '../../services/api';

function ModeratorPendingStoriesPage() {
  const [stories, setStories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadStories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.moderator.getPendingStories(page, 20);
      setStories(response.stories || []);
      setPagination(response.pagination || { page, totalPages: 1, totalItems: 0 });
    } catch (err) {
      console.error('[ModeratorPendingStoriesPage.loadStories] error', err);
      setError('Không thể tải danh sách truyện chờ duyệt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStories(); }, [page]);

  const approveStory = async (story) => {
    if (!window.confirm(`Duyệt và hiển thị truyện “${story.title}”?`)) return;
    try {
      setProcessingId(story.id);
      await API.moderator.approvePendingStory(story.id);
      setMessage(`Đã duyệt truyện “${story.title}”.`);
      setTimeout(() => setMessage(''), 4000);
      await loadStories();
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể duyệt truyện.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="management-page">
      <header className="management-page-header">
        <div><p className="management-eyebrow">HÀNG ĐỢI XUẤT BẢN</p><h2>Truyện chờ duyệt</h2><p>Kiểm tra thông tin tác phẩm trước khi cho phép hiển thị công khai.</p></div>
        <button type="button" onClick={loadStories} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới hàng đợi'}</button>
      </header>

      <div className="pending-summary-bar">
        <div><span>Đang chờ xử lý</span><strong>{pagination.totalItems || 0}</strong></div>
        <p>Mở trang truyện để kiểm tra mô tả, tác giả và nội dung chương trước khi duyệt.</p>
      </div>

      {message ? <div className="alert-cmc">{message}</div> : null}
      {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}

      {loading ? <div className="management-loading panel-like">Đang tải danh sách chờ...</div> : (
        <div className="pending-story-grid">
          {stories.map((story) => (
            <article className="pending-story-card" key={story.id}>
              <div className="pending-story-cover">{story.cover_image_url ? <img src={story.cover_image_url} alt="" /> : <span>{story.title.charAt(0)}</span>}</div>
              <div className="pending-story-body">
                <div className="pending-story-heading"><span className="management-badge warning">Chờ xử lý</span><small>#{story.id}</small></div>
                <h3>{story.title}</h3>
                <p>{story.description || 'Tác giả chưa cung cấp mô tả cho truyện này.'}</p>
                <dl><div><dt>Người đăng</dt><dd>{story.author_full_name || `@${story.author_username}`}</dd></div><div><dt>Thể loại</dt><dd>{story.category || 'Chưa phân loại'}</dd></div><div><dt>Số chương</dt><dd>{story.total_chapters || 0}</dd></div><div><dt>Ngày gửi</dt><dd>{new Date(story.created_at).toLocaleDateString('vi-VN')}</dd></div></dl>
                <div className="pending-story-actions">
                  <Link to={`/story/${story.id}-${story.slug}`} target="_blank" rel="noreferrer">Xem trang truyện</Link>
                  <button type="button" onClick={() => approveStory(story)} disabled={processingId === story.id}>{processingId === story.id ? 'Đang duyệt...' : 'Duyệt & hiển thị'}</button>
                </div>
              </div>
            </article>
          ))}
          {!stories.length ? <div className="comments-empty-state pending-empty"><strong>Hàng đợi đã được xử lý</strong><span>Hiện không có truyện nào đang chờ duyệt.</span></div> : null}
        </div>
      )}

      {pagination.totalPages > 1 ? <nav className="comments-pagination"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Trang trước</button><span>Trang {page} / {pagination.totalPages}</span><button type="button" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((value) => value + 1)}>Trang sau</button></nav> : null}
    </section>
  );
}

export default ModeratorPendingStoriesPage;
