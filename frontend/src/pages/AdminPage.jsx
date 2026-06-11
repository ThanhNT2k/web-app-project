import { useEffect, useState } from 'react';
import API from '../services/api';

function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await API.admin.getStats();
      setStats(res.stats);
    } catch {
      setStats({
        users: 0,
        stories: 0,
        chapters: 0,
        comments: 0,
      });
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="cmc-main">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 className="mb-1">Admin Dashboard</h1>
          <p className="text-muted">
            Manage your story platform
          </p>
        </div>
      </div>

      {message && (
        <div className="alert-cmc mb-3">
          {message}
        </div>
      )}

      {loading && <p>Đang tải...</p>}

      {!loading && stats && (
        <>
          <div className="panel-card mb-4">
            <h4 className="panel-title">
              Tổng quan hệ thống
            </h4>

            <div className="stats-row">
              <div className="stat-box">
                <strong>{stats?.users || 0}</strong>
                <span>Người dùng</span>
              </div>

              <div className="stat-box">
                <strong>{stats?.stories || 0}</strong>
                <span>Truyện</span>
              </div>

              <div className="stat-box">
                <strong>{stats?.chapters || 0}</strong>
                <span>Chương</span>
              </div>

              <div className="stat-box">
                <strong>{stats?.comments || 0}</strong>
                <span>Bình luận</span>
              </div>
            </div>
          </div>

          <div className="panel-card mb-4">
            <h4 className="panel-title">
              Hoạt động gần đây
            </h4>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Hoạt động</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>10 phút trước</td>
                  <td>User mới đăng ký</td>
                </tr>

                <tr>
                  <td>20 phút trước</td>
                  <td>Uploader tạo truyện mới</td>
                </tr>

                <tr>
                  <td>1 giờ trước</td>
                  <td>Admin cập nhật quyền người dùng</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="panel-card">
            <h4 className="panel-title">
              Truyện mới nhất
            </h4>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên truyện</th>
                  <th>Tác giả</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>1</td>
                  <td>Demo Story</td>
                  <td>Admin</td>
                </tr>

                <tr>
                  <td>2</td>
                  <td>Another Story</td>
                  <td>Uploader</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

export default AdminPage;