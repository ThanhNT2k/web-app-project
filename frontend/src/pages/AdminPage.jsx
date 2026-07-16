import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import API from '../services/api';

function AdminPage() {
  const [stats, setStats] = useState(null);
  const [stories, setStories] = useState([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setError('');
      const response = await API.admin.getStats();
      setStats(response.stats || response);
    } catch (err) {

      setError('Không thể tải thống kê hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async () => {
    try {
      setStoriesLoading(true);
      const response = await API.admin.getStories(1, limit);
      setStories((response.stories || []).slice(0, limit));
    } catch (err) {

      setError('Không thể tải danh sách truyện mới.');
    } finally {
      setStoriesLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadStories(); }, [limit]);

  const statItems = [
    ['users', 'Người dùng', 'Tài khoản toàn hệ thống'],
    ['stories', 'Truyện đang hiển thị', 'Kho nội dung công khai'],
    ['chapters', 'Tổng số chương', 'Nội dung đã được đăng'],
    ['comments', 'Bình luận', 'Tương tác cộng đồng'],
  ];

  return (
    <section className="management-page admin-dashboard-page">
      <header className="management-page-header">
        <div>
          <p className="management-eyebrow">TỔNG QUAN HỆ THỐNG</p>
          <h2>Admin Dashboard</h2>
          <p>Theo dõi dữ liệu nền tảng và truy cập nhanh các khu vực quản trị.</p>
        </div>
        <button type="button" onClick={() => { loadStats(); loadStories(); }} disabled={loading || storiesLoading}>
          {loading || storiesLoading ? 'Đang cập nhật...' : 'Cập nhật dữ liệu'}
        </button>
      </header>

      {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}

      <div className="management-stats-grid">
        {statItems.map(([key, label, note]) => (
          <article className={`management-stat stat-${key}`} key={key}>
            <span>{label}</span>
            <strong>{loading ? '—' : stats?.[key] || 0}</strong>
            <small>{note}</small>
          </article>
        ))}
      </div>

      <div className="management-quick-grid">
        {[
          ['/admin/users', 'Quản lý người dùng', 'Phân quyền, khóa hoặc mở khóa tài khoản'],
          ['/admin/stories', 'Quản lý truyện', 'Kiểm soát trạng thái hiển thị nội dung'],
          ['/admin/reports', 'Trung tâm báo cáo', 'Xử lý các báo cáo vi phạm mới'],
          ['/admin/bad-words', 'Bộ lọc từ khóa', 'Quản lý quy tắc kiểm duyệt tự động'],
        ].map(([to, title, description]) => (
          <Link className="management-quick-card" to={to} key={to}>
            <strong>{title}</strong>
            <span>{description}</span>
            <small>Mở khu vực →</small>
          </Link>
        ))}
      </div>

      <section className="management-data-panel">
        <div className="management-panel-heading">
          <div>
            <h3>Truyện mới cập nhật</h3>
            <p>Danh sách nội dung mới nhất trong hệ thống.</p>
          </div>
          <select value={limit} onChange={(event) => setLimit(Number(event.target.value))} aria-label="Số lượng truyện">
            <option value={10}>10 truyện</option>
            <option value={20}>20 truyện</option>
            <option value={30}>30 truyện</option>
          </select>
        </div>

        {storiesLoading ? <div className="management-loading">Đang tải danh sách truyện...</div> : (
          <div className="management-table-wrap">
            <table className="management-table">
              <thead><tr><th>Truyện</th><th>Tác giả</th><th>Chương</th><th>Theo dõi</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {stories.map((story) => (
                  <tr key={story.id}>
                    <td><Link to={`/story/${story.id}-${story.slug}`}>{story.title}</Link><small>#{story.id} · {story.category || 'Chưa phân loại'}</small></td>
                    <td>
                      {story.author_name || 'Không rõ tác giả'}
                      <small>Người đăng: {story.author_full_name || (story.author_username ? `@${story.author_username}` : 'Ẩn danh')}</small>
                    </td>
                    <td>{story.chapter_count || story.total_chapters || 0}</td>
                    <td>{story.follow_count || story.followers || 0}</td>
                    <td><span className={`management-badge ${story.is_published ? 'success' : 'danger'}`}>{story.is_published ? 'Đang hiển thị' : 'Đã ẩn'}</span></td>
                  </tr>
                ))}
                {!stories.length ? <tr><td colSpan="5" className="management-empty-cell">Chưa có dữ liệu truyện.</td></tr> : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminPage;
