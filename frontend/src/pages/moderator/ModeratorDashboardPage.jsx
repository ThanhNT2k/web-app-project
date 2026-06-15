import { useEffect, useState } from 'react';
import API from '../../services/api';

function ModeratorDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await API.moderator.getDashboard();
        setStats(res.stats || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Lỗi khi lấy dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="mb-3">Bảng điều khiển Moderator</h2>
      {loading && <div>Đang tải...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {stats && (
        <div className="row gx-3">
          <div className="col-6 col-md-3">
            <div className="card p-3">Truyện chờ: <strong>{stats.pendingStories}</strong></div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3">Truyện bị ẩn: <strong>{stats.hiddenStories}</strong></div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3">Báo cáo mới: <strong>{stats.reportsPending}</strong></div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3">Tổng bình luận: <strong>{stats.totalComments}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModeratorDashboardPage;
