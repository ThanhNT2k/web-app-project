import { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';

function AdminStoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await API.admin.getStories(1);
      setStories(response.stories || []);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleToggleVisibility = async (id) => {
    try {
      const res = await API.stories.toggleVisibility(id);
      setMessage(res.message || 'Thao tác thành công');
      setTimeout(() => setMessage(''), 4000);
      loadStories();
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể thực hiện thao tác');
    }
  };

  const filteredStories = stories.filter((story) =>
    story.title.toLowerCase().includes(search.toLowerCase()) ||
    (story.author_username && story.author_username.toLowerCase().includes(search.toLowerCase())) ||
    (story.author_full_name && story.author_full_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="cmc-main">
      <div className="mb-4">
        <h1>Quản lý truyện</h1>
        <p className="text-muted">Quản lý hiển thị và trạng thái toàn bộ truyện trong hệ thống</p>
      </div>

      {message && <div className="alert-cmc mb-3">{message}</div>}

      <div className="panel-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Tìm truyện theo tên, tác giả..."
            className="form-control-cmc"
            style={{ maxWidth: '300px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-muted">Đang tải danh sách truyện...</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ảnh bìa</th>
                  <th>Tên truyện</th>
                  <th>Tác giả</th>
                  <th>Số chương</th>
                  <th>Trạng thái hiển thị</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredStories.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      Không tìm thấy truyện nào.
                    </td>
                  </tr>
                ) : (
                  filteredStories.map((story) => (
                    <tr key={story.id}>
                      <td>{story.id}</td>
                      <td>
                        {story.cover_image_url ? (
                          <img
                            src={story.cover_image_url}
                            alt=""
                            style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '40px',
                              height: '55px',
                              background: 'var(--border)',
                              display: 'grid',
                              placeItems: 'center',
                              borderRadius: '4px',
                            }}
                          >
                            📖
                          </div>
                        )}
                      </td>
                      <td>
                        <Link to={`/story/${story.slug}`} style={{ fontWeight: 600, color: 'var(--text)' }}>
                          {story.title}
                        </Link>
                      </td>
                      <td>{story.author_full_name || story.author_username || 'Ẩn danh'}</td>
                      <td>{story.total_chapters || 0}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: story.is_published ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: story.is_published ? '#10b981' : '#ef4444',
                          }}
                        >
                          {story.is_published ? 'Đang hiển thị' : 'Đã ẩn'}
                          {story.hidden_by_admin && ' (bởi Admin)'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`btn-cmc btn-sm ${story.is_published ? 'btn-cmc-outline' : 'btn-cmc-primary'}`}
                          onClick={() => handleToggleVisibility(story.id)}
                        >
                          {story.is_published ? 'Ẩn truyện' : 'Hiện truyện'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminStoriesPage;