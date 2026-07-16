import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import API from '../../services/api';

function ModeratorDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.moderator.getDashboard();
      setStats(response.stats || response);
    } catch (err) {

      setError('Không thể tải dữ liệu kiểm duyệt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  return (
    <section className="management-page moderator-dashboard-page">
      <header className="management-page-header">
        <div>
          <p className="management-eyebrow">TRUNG TÂM VẬN HÀNH</p>
          <h2>Tổng quan kiểm duyệt</h2>
          <p>Nắm nhanh hàng đợi và chuyển đến khu vực cần ưu tiên xử lý.</p>
        </div>
        <button type="button" onClick={loadDashboard} disabled={loading}>
          {loading ? 'Đang cập nhật...' : 'Làm mới dữ liệu'}
        </button>
      </header>

      {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}

      <div className="management-stats-grid">
        {[
          ['pendingStories', 'Truyện chờ duyệt', 'Hàng đợi xuất bản'],
          ['hiddenStories', 'Truyện bị ẩn', 'Nội dung đang hạn chế'],
          ['reportsPending', 'Báo cáo mới', 'Cần xem xét sớm'],
          ['totalComments', 'Tổng bình luận', 'Quy mô cộng đồng'],
        ].map(([key, label, note]) => (
          <article className={`management-stat stat-${key}`} key={key}>
            <span>{label}</span>
            <strong>{loading ? '—' : stats?.[key] || 0}</strong>
            <small>{note}</small>
          </article>
        ))}
      </div>

      <div className="moderation-priority-grid">
        <Link to="/moderator/reports" className="moderation-priority-card priority-high">
          <span>Ưu tiên cao</span>
          <strong>Xử lý báo cáo mới</strong>
          <p>{stats?.reportsPending || 0} báo cáo đang chờ phân loại và phương án xử lý.</p>
          <small>Mở trung tâm báo cáo →</small>
        </Link>
        <Link to="/moderator/pending-stories" className="moderation-priority-card priority-medium">
          <span>Hàng đợi nội dung</span>
          <strong>Duyệt truyện chờ</strong>
          <p>{stats?.pendingStories || 0} truyện cần được kiểm tra trước khi hiển thị.</p>
          <small>Mở danh sách chờ →</small>
        </Link>
        <Link to="/moderator/comments" className="moderation-priority-card priority-normal">
          <span>Cộng đồng</span>
          <strong>Kiểm duyệt bình luận</strong>
          <p>Tìm kiếm và xử lý nội dung nhạy cảm, spam hoặc vi phạm.</p>
          <small>Mở quản lý bình luận →</small>
        </Link>
      </div>

      <section className="management-data-panel moderation-guidelines">
        <div className="management-panel-heading"><div><h3>Quy trình xử lý đề xuất</h3><p>Giữ quyết định kiểm duyệt nhất quán và có thể truy vết.</p></div></div>
        <ol>
          <li><strong>Kiểm tra ngữ cảnh</strong><span>Đọc nội dung và đối chiếu đối tượng liên quan.</span></li>
          <li><strong>Chọn phương án phù hợp</strong><span>Ưu tiên hành động ít tác động nhất nhưng đủ ngăn vi phạm.</span></li>
          <li><strong>Ghi nhận kết quả</strong><span>Thêm ghi chú xử lý khi báo cáo cần căn cứ về sau.</span></li>
        </ol>
      </section>
    </section>
  );
}

export default ModeratorDashboardPage;
