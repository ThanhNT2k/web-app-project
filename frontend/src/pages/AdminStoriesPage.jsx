import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import API from '../services/api';

function AdminStoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [search, setSearch] = useState('');
  const [visibility, setVisibility] = useState('ALL');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadStories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.admin.getStories(1, 100);
      setStories(response.stories || []);
    } catch (err) {

      setError('Không thể tải danh sách truyện.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStories(); }, []);

  const filteredStories = useMemo(() => stories.filter((story) => {
    const keyword = search.toLowerCase().trim();
    const matchesSearch = !keyword || [story.title, story.author_name, story.author_username, story.author_full_name].some((value) => value?.toLowerCase().includes(keyword));
    const matchesVisibility = visibility === 'ALL' || (visibility === 'PUBLISHED' ? story.is_published : !story.is_published);
    return matchesSearch && matchesVisibility;
  }), [stories, search, visibility]);

  const visibleCount = stories.filter((story) => story.is_published).length;
  const hiddenByAdminCount = stories.filter((story) => story.hidden_by_admin).length;

  const handleToggleVisibility = async (story) => {
    const action = story.is_published ? 'ẩn' : 'hiển thị';
    if (!window.confirm(`Xác nhận ${action} truyện “${story.title}”?`)) return;
    try {
      setProcessingId(story.id);
      const response = await API.stories.toggleVisibility(story.id);
      setMessage(response.message || 'Đã cập nhật trạng thái truyện.');
      setTimeout(() => setMessage(''), 4000);
      await loadStories();
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể cập nhật truyện.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="management-page">
      <header className="management-page-header">
        <div><p className="management-eyebrow">KHO NỘI DUNG</p><h2>Quản lý truyện</h2><p>Kiểm soát trạng thái hiển thị và theo dõi thông tin tác phẩm.</p></div>
        <button type="button" onClick={loadStories} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</button>
      </header>

      <div className="management-stats-grid compact">
        <article className="management-stat"><span>Tổng truyện</span><strong>{stories.length}</strong><small>Trong dữ liệu đã tải</small></article>
        <article className="management-stat stat-active"><span>Đang hiển thị</span><strong>{visibleCount}</strong><small>Có thể truy cập công khai</small></article>
        <article className="management-stat stat-locked"><span>Đang ẩn</span><strong>{stories.length - visibleCount}</strong><small>Chưa hoặc ngừng xuất bản</small></article>
        <article className="management-stat stat-admins"><span>Admin đã ẩn</span><strong>{hiddenByAdminCount}</strong><small>Nội dung bị hạn chế tuyệt đối</small></article>
      </div>

      <section className="management-data-panel">
        <div className="management-toolbar">
          <div className="management-search-form"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên truyện hoặc tác giả..." /></div>
          <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
            <option value="ALL">Tất cả trạng thái</option><option value="PUBLISHED">Đang hiển thị</option><option value="HIDDEN">Đang ẩn</option>
          </select>
        </div>
        {message ? <div className="alert-cmc">{message}</div> : null}
        {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}

        {loading ? <div className="management-loading">Đang tải danh sách truyện...</div> : (
          <div className="management-table-wrap">
            <table className="management-table stories-table">
              <thead><tr><th>Truyện</th><th>Tác giả</th><th>Người đăng</th><th>Chương</th><th>Phát hành</th><th>Hiển thị</th><th>Hành động</th></tr></thead>
              <tbody>
                {filteredStories.map((story) => (
                  <tr key={story.id}>
                    <td><div className="management-story"><div className="management-story-cover">{story.cover_image_url ? <img src={story.cover_image_url} alt="" /> : <span>{story.title.charAt(0)}</span>}</div><div><Link to={`/story/${story.id}-${story.slug}`}>{story.title}</Link><small>#{story.id} · {story.category || 'Chưa phân loại'}</small></div></div></td>
                    <td>{story.author_name || 'Không rõ tác giả'}</td>
                    <td>{story.author_full_name || (story.author_username ? `@${story.author_username}` : 'Ẩn danh')}</td>
                    <td>{story.chapter_count || story.total_chapters || 0}</td>
                    <td>{story.status || 'Ongoing'}</td>
                    <td><span className={`management-badge ${story.is_published ? 'success' : 'danger'}`}>{story.is_published ? 'Đang hiển thị' : story.hidden_by_admin ? 'Admin đã ẩn' : 'Chưa hiển thị'}</span></td>
                    <td><button type="button" className={story.is_published ? 'danger-outline' : 'primary-action'} disabled={processingId === story.id} onClick={() => handleToggleVisibility(story)}>{processingId === story.id ? 'Đang cập nhật...' : story.is_published ? 'Ẩn truyện' : 'Hiện truyện'}</button></td>
                  </tr>
                ))}
                {!filteredStories.length ? <tr><td colSpan="7" className="management-empty-cell">Không tìm thấy truyện phù hợp.</td></tr> : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminStoriesPage;
