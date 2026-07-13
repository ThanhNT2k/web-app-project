import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import API from '../../services/api';

function ModeratorPendingStoriesPage() {
  const [stories, setStories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedAction, setSelectedAction] = useState('approve');
  const [reviewNote, setReviewNote] = useState('');
  const [processError, setProcessError] = useState('');
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

  const openProcessPanel = (story) => {
    setSelectedStory(story);
    setSelectedAction('approve');
    setReviewNote('');
    setProcessError('');
    setError('');
  };

  const closeProcessPanel = () => {
    if (processingId) return;
    setSelectedStory(null);
    setReviewNote('');
    setProcessError('');
  };

  const processStory = async (event) => {
    event.preventDefault();
    if (!selectedStory) return;
    if (selectedAction !== 'approve' && !reviewNote.trim()) {
      setProcessError('Vui lòng nhập lý do khi yêu cầu chỉnh sửa hoặc từ chối truyện.');
      return;
    }

    try {
      setProcessingId(selectedStory.id);
      setProcessError('');
      const response = await API.moderator.processPendingStory(
        selectedStory.id,
        selectedAction,
        reviewNote.trim(),
      );
      setMessage(`${response.message || 'Đã xử lý truyện'} “${selectedStory.title}”.`);
      setTimeout(() => setMessage(''), 4000);
      setSelectedStory(null);
      setReviewNote('');
      await loadStories();
    } catch (err) {
      setProcessError(err?.response?.data?.message || 'Không thể xử lý truyện.');
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
                <p>{story.description || 'Người đăng chưa cung cấp mô tả cho truyện này.'}</p>
                <dl><div><dt>Tác giả</dt><dd>{story.author_name || 'Không rõ tác giả'}</dd></div><div><dt>Người đăng</dt><dd>{story.author_full_name || (story.author_username ? `@${story.author_username}` : 'Không rõ')}</dd></div><div><dt>Thể loại</dt><dd>{story.category || 'Chưa phân loại'}</dd></div><div><dt>Số chương</dt><dd>{story.total_chapters || 0}</dd></div><div><dt>Ngày gửi</dt><dd>{new Date(story.created_at).toLocaleDateString('vi-VN')}</dd></div></dl>
                <div className="pending-story-actions">
                  <Link to={`/story/${story.id}-${story.slug}`} target="_blank" rel="noreferrer">Xem trang truyện</Link>
                  <button type="button" onClick={() => openProcessPanel(story)} disabled={processingId === story.id}>
                    {processingId === story.id ? 'Đang xử lý...' : 'Chọn phương án xử lý'}
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!stories.length ? <div className="comments-empty-state pending-empty"><strong>Hàng đợi đã được xử lý</strong><span>Hiện không có truyện nào đang chờ duyệt.</span></div> : null}
        </div>
      )}

      {pagination.totalPages > 1 ? <nav className="comments-pagination"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Trang trước</button><span>Trang {page} / {pagination.totalPages}</span><button type="button" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((value) => value + 1)}>Trang sau</button></nav> : null}

      {selectedStory ? (
        <div className="report-process-overlay" role="presentation" onMouseDown={closeProcessPanel}>
          <form
            className="report-process-dialog pending-story-process-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="process-story-title"
            onSubmit={processStory}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="report-process-heading">
              <div>
                <span>Truyện #{selectedStory.id}</span>
                <h3 id="process-story-title">Chọn phương án xử lý</h3>
              </div>
              <button type="button" onClick={closeProcessPanel} aria-label="Đóng">×</button>
            </div>

            <div className="report-process-context pending-story-process-context">
              {selectedStory.cover_image_url ? <img src={selectedStory.cover_image_url} alt="" /> : null}
              <div>
                <strong>{selectedStory.title}</strong>
                <span>Tác giả: {selectedStory.author_name || 'Không rõ tác giả'}</span>
                <span>Người đăng: {selectedStory.author_full_name || (selectedStory.author_username ? `@${selectedStory.author_username}` : 'Không rõ')}</span>
              </div>
            </div>

            <label htmlFor="story-review-action">Phương án</label>
            <select
              id="story-review-action"
              value={selectedAction}
              onChange={(event) => {
                setSelectedAction(event.target.value);
                setProcessError('');
              }}
            >
              <option value="approve">Duyệt và hiển thị công khai</option>
              <option value="request_changes">Yêu cầu người đăng chỉnh sửa</option>
              <option value="reject">Từ chối xuất bản</option>
            </select>

            <div className={`pending-review-guidance ${selectedAction}`}>
              {selectedAction === 'approve' ? 'Truyện sẽ được xuất bản và hiển thị với người đọc.' : null}
              {selectedAction === 'request_changes' ? 'Truyện được đưa khỏi hàng đợi; người đăng sẽ nhận thông báo và lý do cần chỉnh sửa.' : null}
              {selectedAction === 'reject' ? 'Truyện không được xuất bản; người đăng sẽ nhận thông báo từ chối kèm lý do.' : null}
            </div>

            {processError ? <div className="alert-cmc alert-cmc-warning pending-process-error">{processError}</div> : null}

            <label htmlFor="story-review-note">
              Ghi chú xử lý {selectedAction === 'approve' ? '(không bắt buộc)' : '(bắt buộc)'}
            </label>
            <textarea
              id="story-review-note"
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              maxLength={1000}
              rows={5}
              placeholder={selectedAction === 'approve'
                ? 'Ghi chú nội bộ về quyết định duyệt...'
                : 'Nêu rõ nội dung chưa phù hợp và hướng chỉnh sửa...'}
              required={selectedAction !== 'approve'}
            />
            <small>{reviewNote.length}/1000</small>

            <div className="report-process-actions">
              <button type="button" onClick={closeProcessPanel} disabled={Boolean(processingId)}>Hủy</button>
              <button
                type="submit"
                className={selectedAction === 'reject' ? 'danger-action' : ''}
                disabled={Boolean(processingId) || (selectedAction !== 'approve' && !reviewNote.trim())}
              >
                {processingId ? 'Đang xử lý...' : 'Xác nhận phương án'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

export default ModeratorPendingStoriesPage;
