import { useEffect, useState } from 'react';
import API from '../../services/api';
import { Link } from 'react-router-dom';

function ModeratorPendingStoriesPage() {
  const [stories, setStories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await API.moderator.getPendingStories(page, 20);
        setStories(res.stories || []);
        setPagination(res.pagination || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h2 className="section-title mb-4">Duyệt truyện chờ</h2>

      <div className="panel-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="panel-title mb-0">Danh sách chờ</h3>
          <button 
            className="btn-cmc btn-cmc-outline btn-sm" 
            onClick={() => setPage(1)} // Nút làm mới sẽ gọi lại trang 1
          >
            Làm mới 🔄
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên truyện</th>
                <th>Người đăng</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">Đang tải dữ liệu...</td>
                </tr>
              )}
              
              {!loading && stories.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">Không có truyện nào đang chờ duyệt.</td>
                </tr>
              )}

              {!loading && stories.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.title}</strong></td>
                  <td>@{s.author_username}</td>
                  <td>
                    <span className="badge-role" style={{ background: '#fef08a', color: '#ca8a04' }}>
                      Chờ xử lý
                    </span>
                  </td>
                  <td>
                    <Link 
                      to={`/moderator/pending-stories/${s.id}`} 
                      className="btn-cmc btn-cmc-primary btn-sm"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cụm Phân Trang (Pagination) phong cách CMC */}
        {pagination && pagination.totalPages > 0 && (
          <div className="mt-4 d-flex justify-content-between align-items-center border-top pt-3">
            <div className="text-muted small">
              Trang <strong>{pagination.page}</strong> / {pagination.totalPages}
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn-cmc btn-cmc-outline btn-sm" 
                disabled={page <= 1} 
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Quay lại
              </button>
              <button 
                className="btn-cmc btn-cmc-primary btn-sm" 
                disabled={page >= pagination.totalPages} 
                onClick={() => setPage((p) => p + 1)}
              >
                Tiếp →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModeratorPendingStoriesPage;