import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TagInput from '../components/TagInput';
import { slugify } from '../utils/slugify';

const EMPTY_STORY = {
  title: '',
  description: '',
  category: '',
  cover_image_url: '',
  status: 'Ongoing',
  tags: [],
};

function DashboardPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_STORY);
  const [chapterModal, setChapterModal] = useState(null);
  const [chapterForm, setChapterForm] = useState({ title: '', content: '', chapter_number: 1 });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const loadStories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.stories.getMine(1, 50);
      setStories(response.stories || []);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_STORY);
    setModalOpen(true);
  };

  const openEdit = (story) => {
    setEditing(story);
    setForm({
      title: story.title,
      description: story.description || '',
      category: story.category || '',
      cover_image_url: story.cover_image_url || '',
      status: story.status || 'Ongoing',
      tags: (story.tags || []).map((t) => t.name).length
        ? story.tags.map((t) => t.name)
        : story.category
          ? [story.category]
          : [],
    });
    setModalOpen(true);
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await API.upload.cover(file);
      setForm((f) => ({ ...f, cover_image_url: res.url }));
    } catch {
      setMessage('Upload ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const saveStory = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category || form.tags[0] || null,
        cover_image_url: form.cover_image_url,
        status: form.status,
        tags: form.tags,
      };

      if (editing) {
        await API.stories.update(editing.id, payload);
        setMessage('Đã cập nhật truyện');
      } else {
        await API.stories.create({
          ...payload,
          slug: slugify(form.title),
        });
        setMessage('Đã tạo truyện mới');
      }
      setModalOpen(false);
      loadStories();
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Lưu thất bại');
    }
  };

  const deleteStory = async (id) => {
    if (!window.confirm('Xóa (ẩn) truyện này?')) return;
    try {
      await API.stories.delete(id);
      loadStories();
      setMessage('Đã xóa truyện');
    } catch {
      setMessage('Không xóa được');
    }
  };

  const openChapterModal = (story) => {
    setChapterModal(story);
    setChapterForm({
      title: '',
      content: '',
      chapter_number: (story.total_chapters || 0) + 1,
    });
  };

  const saveChapter = async (event) => {
    event.preventDefault();
    try {
      await API.chapters.create(chapterModal.id, chapterForm);
      setChapterModal(null);
      setMessage('Đã thêm chương');
      loadStories();
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Thêm chương thất bại');
    }
  };

  return (
    <main className="cmc-main">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="mb-1">Quản lý truyện</h1>
          <p className="text-muted mb-0">
            Xin chào,
            {' '}
            {user?.full_name || user?.username}
            {' '}
            (
            {user?.role}
            )
          </p>
        </div>
        <button type="button" className="btn-cmc btn-cmc-primary" onClick={openCreate}>
          + Thêm truyện
        </button>
      </div>

      {message ? <div className="alert-cmc mb-3">{message}</div> : null}

      {loading ? <p className="text-muted">Đang tải...</p> : null}

      <div className="dashboard-grid">
        {stories.map((story) => (
          <div key={story.id} className="panel-card">
            <div className="d-flex gap-3">
              {story.cover_image_url ? (
                <img src={story.cover_image_url} alt="" className="dashboard-thumb" />
              ) : (
                <div className="dashboard-thumb dashboard-thumb-empty">📖</div>
              )}
              <div className="flex-grow-1">
                <h5 className="mb-1">{story.title}</h5>
                <p className="small text-muted mb-2">
                  {story.category}
                  {' · '}
                  {story.total_chapters}
                  {' chương · '}
                  {story.status}
                </p>
                <p className="small mb-3 story-clamp">{story.description}</p>
                <div className="d-flex flex-wrap gap-2">
                  <Link to={`/story/${story.id}`} className="btn-cmc btn-cmc-outline btn-sm">
                    Xem
                  </Link>
                  <button type="button" className="btn-cmc btn-cmc-outline btn-sm" onClick={() => openEdit(story)}>
                    Sửa
                  </button>
                  <button type="button" className="btn-cmc btn-cmc-primary btn-sm" onClick={() => openChapterModal(story)}>
                    + Chương
                  </button>
                  <button type="button" className="btn-link-danger btn-sm" onClick={() => deleteStory(story.id)}>
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && stories.length === 0 ? (
        <p className="text-muted">Chưa có truyện. Bấm &quot;Thêm truyện&quot; để bắt đầu.</p>
      ) : null}

      {modalOpen ? (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-content modal-content-lg">
            <button type="button" className="close-modal" onClick={() => setModalOpen(false)}>&times;</button>
            <h2>{editing ? 'Sửa truyện' : 'Thêm truyện mới'}</h2>
            <form onSubmit={saveStory} className="d-grid gap-3 mt-3">
              <input
                className="form-control-cmc"
                placeholder="Tiêu đề"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <textarea
                className="form-control-cmc"
                rows={4}
                placeholder="Mô tả"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
              <select
                className="form-control-cmc"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Ongoing">Đang ra</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Hiatus">Tạm dừng</option>
              </select>
              <TagInput
                value={form.tags}
                onChange={(tags) => setForm({ ...form, tags })}
              />
              <div>
                <label className="small text-muted d-block mb-1">Ảnh bìa</label>
                <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploading} />
                {form.cover_image_url ? (
                  <input
                    className="form-control-cmc mt-2"
                    value={form.cover_image_url}
                    onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                    placeholder="URL ảnh bìa"
                  />
                ) : null}
              </div>
              <button type="submit" className="btn-cmc btn-cmc-primary" disabled={uploading}>
                {editing ? 'Cập nhật' : 'Tạo truyện'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {chapterModal ? (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setChapterModal(null)}>
          <div className="modal-content modal-content-lg">
            <button type="button" className="close-modal" onClick={() => setChapterModal(null)}>&times;</button>
            <h2>Thêm chương — {chapterModal.title}</h2>
            <form onSubmit={saveChapter} className="d-grid gap-3 mt-3">
              <input
                type="number"
                className="form-control-cmc"
                min={1}
                value={chapterForm.chapter_number}
                onChange={(e) => setChapterForm({ ...chapterForm, chapter_number: Number(e.target.value) })}
                required
              />
              <input
                className="form-control-cmc"
                placeholder="Tiêu đề chương"
                value={chapterForm.title}
                onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                required
              />
              <textarea
                className="form-control-cmc"
                rows={8}
                placeholder="Nội dung chương"
                value={chapterForm.content}
                onChange={(e) => setChapterForm({ ...chapterForm, content: e.target.value })}
                required
              />
              <button type="submit" className="btn-cmc btn-cmc-primary">Lưu chương</button>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default DashboardPage;
