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
    <div>
      <h2 className="mb-3">Duyệt truyện chờ</h2>
      {loading && <div>Đang tải...</div>}
      {!loading && stories.length === 0 && <div>Không có truyện chờ.</div>}

      <div className="list-group">
        {stories.map((s) => (
          <div key={s.id} className="list-group-item d-flex justify-content-between align-items-start">
            <div>
              <Link to={`/story/${s.slug}`} className="h6">{s.title}</Link>
              <div className="text-muted small">Tác giả: {s.author_username}</div>
            </div>
            <div>
              <Link to={`/moderator/pending-stories/${s.id}`} className="btn btn-sm btn-outline-primary">Xem</Link>
            </div>
          </div>
        ))}
      </div>

      {pagination && (
        <div className="mt-3 d-flex justify-content-between align-items-center">
          <div>Trang {pagination.page} / {pagination.totalPages}</div>
          <div>
            <button className="btn btn-sm btn-secondary me-2" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Quay lại</button>
            <button className="btn btn-sm btn-primary" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Tiếp</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModeratorPendingStoriesPage;
