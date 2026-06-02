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

const EMPTY_CHAPTER_FORM = { title: '', content: '', chapter_number: 1 };

function DashboardPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Story modal
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_STORY);
  const [uploading, setUploading] = useState(false);

  // Chapter modal (add / edit)
  const [chapterModal, setChapterModal] = useState(null); // { story, chapter|null }
  const [chapterForm, setChapterForm] = useState(EMPTY_CHAPTER_FORM);

  // Expanded chapter list per story
  const [expandedStory, setExpandedStory] = useState(null);
  const [storyChapters, setStoryChapters] = useState({}); // { storyId: chapter[] }
  const [chaptersLoading, setChaptersLoading] = useState(false);

  const [message, setMessage] = useState('');

  // ── Helpers ──────────────────────────────────────────────────────────────

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

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

  const loadChaptersForStory = useCallback(async (storyId) => {
    try {
      setChaptersLoading(true);
      const response = await API.chapters.getByStory(storyId, 1, 200);
      setStoryChapters((prev) => ({ ...prev, [storyId]: response.chapters || [] }));
    } catch {
      setStoryChapters((prev) => ({ ...prev, [storyId]: [] }));
    } finally {
      setChaptersLoading(false);
    }
  }, []);

  // ── Story CRUD ────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_STORY);
    setStoryModalOpen(true);
  };

  const openEdit = (story) => {
    setEditing(story);
    setForm({
      title: story.title,
      description: story.description || '',
      category: story.category || '',
      cover_image_url: story.cover_image_url || '',
      status: story.status || 'Ongoing',
      tags: story.tags?.length ? story.tags.map((t) => t.name) : story.category ? [story.category] : [],
    });
    setStoryModalOpen(true);
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await API.upload.cover(file);
      setForm((f) => ({ ...f, cover_image_url: res.url }));
    } catch {
      showMessage('Upload ảnh thất bại');
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
        showMessage('Đã cập nhật truyện');
      } else {
        await API.stories.create({ ...payload, slug: slugify(form.title) });
        showMessage('Đã tạo truyện mới');
      }
      setStoryModalOpen(false);
      loadStories();
    } catch (err) {
      showMessage(err?.response?.data?.message || 'Lưu thất bại');
    }
  };

  const deleteStory = async (id) => {
    if (!window.confirm('Xóa (ẩn) truyện này?')) return;
    try {
      await API.stories.delete(id);
      loadStories();
      showMessage('Đã xóa truyện');
    } catch {
      showMessage('Không xóa được');
    }
  };

  // ── Chapter CRUD ──────────────────────────────────────────────────────────

  const openAddChapter = (story) => {
    setChapterModal({ story, chapter: null });
    const currentChapters = storyChapters[story.id] || [];
    setChapterForm({
      title: '',
      content: '',
      chapter_number: (story.total_chapters || currentChapters.length || 0) + 1,
    });
  };

  const openEditChapter = (story, chapter) => {
    setChapterModal({ story, chapter });
    setChapterForm({
      title: chapter.title || '',
      content: chapter.content || '',
      chapter_number: chapter.chapter_number,
    });
  };

  const saveChapter = async (event) => {
    event.preventDefault();
    const { story, chapter } = chapterModal;
    try {
      if (chapter) {
        // Edit existing
        await API.chapters.update(story.id, chapter.id, {
          title: chapterForm.title,
          content: chapterForm.content,
        });
        showMessage('Đã cập nhật chương');
      } else {
        // Create new
        await API.chapters.create(story.id, chapterForm);
        showMessage('Đã thêm chương');
        loadStories();
      }
      setChapterModal(null);
      // Refresh the chapter list if it's currently expanded
      if (expandedStory === story.id) {
        loadChaptersForStory(story.id);
      }
    } catch (err) {
      showMessage(err?.response?.data?.message || 'Thao tác chương thất bại');
    }
  };

  const deleteChapter = async (story, chapter) => {
    if (!window.confirm(`Xóa chương ${chapter.chapter_number}: "${chapter.title}"?`)) return;
    try {
      await API.chapters.delete(story.id, chapter.id);
      showMessage('Đã xóa chương');
      loadChaptersForStory(story.id);
      loadStories();
    } catch {
      showMessage('Không xóa được chương');
    }
  };

  // ── Toggle chapter list ───────────────────────────────────────────────────

  const toggleChapterList = (storyId) => {
    if (expandedStory === storyId) {
      setExpandedStory(null);
    } else {
      setExpandedStory(storyId);
      if (!storyChapters[storyId]) {
        loadChaptersForStory(storyId);
      }
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="cmc-main">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="mb-1">Quản lý truyện</h1>
          <p className="text-muted mb-0">
            Xin chào, {user?.full_name || user?.username} ({user?.role})
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
                  {story.category} · {story.total_chapters} chương · {story.status}
                </p>
                <p className="small mb-3 story-clamp">{story.description}</p>
                <div className="d-flex flex-wrap gap-2">
                  <Link to={`/story/${story.id}`} className="btn-cmc btn-cmc-outline btn-sm">
                    Xem
                  </Link>
                  <button type="button" className="btn-cmc btn-cmc-outline btn-sm" onClick={() => openEdit(story)}>
                    Sửa truyện
                  </button>
                  <button
                    type="button"
                    className="btn-cmc btn-cmc-primary btn-sm"
                    onClick={() => openAddChapter(story)}
                  >
                    + Chương
                  </button>
                  <button
                    type="button"
                    className="btn-cmc btn-cmc-outline btn-sm"
                    onClick={() => toggleChapterList(story.id)}
                  >
                    {expandedStory === story.id ? '▲ Ẩn chương' : '▼ Xem chương'}
                  </button>
                  <button
                    type="button"
                    className="btn-link-danger btn-sm"
                    onClick={() => deleteStory(story.id)}
                  >
                    Xóa truyện
                  </button>
                </div>

                {/* Inline chapter list */}
                {expandedStory === story.id && (
                  <div className="mt-3">
                    {chaptersLoading ? (
                      <p className="small text-muted">Đang tải...</p>
                    ) : (storyChapters[story.id] || []).length === 0 ? (
                      <p className="small text-muted">Chưa có chương nào.</p>
                    ) : (
                      <ul className="chapter-list chapter-list-compact">
                        {(storyChapters[story.id] || []).map((ch) => (
                          <li key={ch.id} className="d-flex justify-content-between align-items-center py-1">
                            <span className="small">
                              Ch.{ch.chapter_number}: {ch.title}
                            </span>
                            <div className="d-flex gap-1">
                              <button
                                type="button"
                                className="btn-cmc btn-cmc-outline btn-xs"
                                onClick={() => openEditChapter(story, ch)}
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                className="btn-link-danger btn-xs"
                                onClick={() => deleteChapter(story, ch)}
                              >
                                Xóa
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && stories.length === 0 ? (
        <p className="text-muted">Chưa có truyện. Bấm &quot;Thêm truyện&quot; để bắt đầu.</p>
      ) : null}

      {/* ── Story modal ──────────────────────────────────────────────────── */}
      {storyModalOpen ? (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setStoryModalOpen(false)}>
          <div className="modal-content modal-content-lg">
            <button type="button" className="close-modal" onClick={() => setStoryModalOpen(false)}>&times;</button>
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
              <TagInput value={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
              <div>
                <label className="small text-muted d-block mb-1">Ảnh bìa</label>
                <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploading} />
                {uploading && <span className="small text-muted ms-2">Đang upload...</span>}
                {form.cover_image_url ? (
                  <>
                    <img
                      src={form.cover_image_url}
                      alt="preview"
                      style={{ width: 80, height: 110, objectFit: 'cover', borderRadius: 6, marginTop: 8 }}
                    />
                    <input
                      className="form-control-cmc mt-2"
                      value={form.cover_image_url}
                      onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                      placeholder="URL ảnh bìa"
                    />
                  </>
                ) : null}
              </div>
              <button type="submit" className="btn-cmc btn-cmc-primary" disabled={uploading}>
                {editing ? 'Cập nhật' : 'Tạo truyện'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* ── Chapter modal (add / edit) ────────────────────────────────────── */}
      {chapterModal ? (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setChapterModal(null)}>
          <div className="modal-content modal-content-lg">
            <button type="button" className="close-modal" onClick={() => setChapterModal(null)}>&times;</button>
            <h2>
              {chapterModal.chapter
                ? `Sửa chương ${chapterModal.chapter.chapter_number} — ${chapterModal.story.title}`
                : `Thêm chương — ${chapterModal.story.title}`}
            </h2>
            <form onSubmit={saveChapter} className="d-grid gap-3 mt-3">
              {!chapterModal.chapter && (
                <input
                  type="number"
                  className="form-control-cmc"
                  min={1}
                  placeholder="Số chương"
                  value={chapterForm.chapter_number}
                  onChange={(e) => setChapterForm({ ...chapterForm, chapter_number: Number(e.target.value) })}
                  required
                />
              )}
              <input
                className="form-control-cmc"
                placeholder="Tiêu đề chương"
                value={chapterForm.title}
                onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                required
              />
              <textarea
                className="form-control-cmc"
                rows={10}
                placeholder="Nội dung chương"
                value={chapterForm.content}
                onChange={(e) => setChapterForm({ ...chapterForm, content: e.target.value })}
                required
              />
              <button type="submit" className="btn-cmc btn-cmc-primary">
                {chapterModal.chapter ? 'Lưu thay đổi' : 'Thêm chương'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default DashboardPage;
