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

  // Collaborators modal
  const [collabModalStory, setCollabModalStory] = useState(null);
  const [collabList, setCollabList] = useState([]);
  const [collabLoading, setCollabLoading] = useState(false);
  const [newCollabEmail, setNewCollabEmail] = useState('');
  const [collabError, setCollabError] = useState('');

  // ── Helpers ──────────────────────────────────────────────────────────────

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  const loadStories = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (user?.role === 'Admin') {
        response = await API.admin.getStories(1);
      } else {
        response = await API.stories.getMine(1, 50);
      }
      setStories(response.stories || []);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  const handleToggleVisibility = async (id) => {
    try {
      const res = await API.stories.toggleVisibility(id);
      loadStories();
      showMessage(res.message || 'Thao tác thành công');
    } catch (err) {
      showMessage(err?.response?.data?.message || 'Không thể thực hiện thao tác');
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
        await API.chapters.update(story.id, chapter.id, {
          title: chapterForm.title,
          content: chapterForm.content,
        });
        showMessage('Đã cập nhật chương');
      } else {
        await API.chapters.create(story.id, chapterForm);
        showMessage('Đã thêm chương');
        loadStories();
      }
      setChapterModal(null);
      // LUÔN LUÔN load lại danh sách chương dù là sửa hay thêm
      loadChaptersForStory(story.id); 
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

  const openCollaborators = async (story) => {
    setCollabModalStory(story);
    setNewCollabEmail('');
    setCollabError('');
    setCollabList([]);
    try {
      setCollabLoading(true);
      const res = await API.stories.getCollaborators(story.id);
      setCollabList(res.collaborators || []);
    } catch {
      setCollabError('Không tải được danh sách cộng tác viên');
    } finally {
      setCollabLoading(false);
    }
  };

  const addCollaborator = async (e) => {
    e.preventDefault();
    if (!newCollabEmail.trim()) return;
    setCollabError('');
    try {
      setCollabLoading(true);
      const res = await API.stories.addCollaborator(collabModalStory.id, { email: newCollabEmail.trim() });
      setCollabList((prev) => [...prev, res.collaborator]);
      setNewCollabEmail('');
      showMessage('Đã thêm cộng tác viên');
    } catch (err) {
      setCollabError(err?.response?.data?.message || 'Không thể thêm cộng tác viên');
    } finally {
      setCollabLoading(false);
    }
  };

  const removeCollaborator = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa cộng tác viên này khỏi truyện?')) return;
    setCollabError('');
    try {
      setCollabLoading(true);
      await API.stories.removeCollaborator(collabModalStory.id, userId);
      setCollabList((prev) => prev.filter((c) => c.id !== userId));
      showMessage('Đã gỡ cộng tác viên');
    } catch (err) {
      setCollabError(err?.response?.data?.message || 'Không thể xóa cộng tác viên');
    } finally {
      setCollabLoading(false);
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
        {stories.map((story) => {
          const isOwner = user?.role === 'Admin' || Number(story.author_id) === Number(user?.id);
          return (
            <div key={story.id} className="panel-card">
              <div className="d-flex gap-3">
                {story.cover_image_url ? (
                  <img src={story.cover_image_url} alt="" className="dashboard-thumb" />
                ) : (
                  <div className="dashboard-thumb dashboard-thumb-empty">📖</div>
                )}
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h5 className="mb-0">{story.title}</h5>
                    {user?.role !== 'Admin' && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          background: isOwner ? 'rgba(59, 130, 246, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          color: isOwner ? '#3b82f6' : '#f59e0b',
                        }}
                      >
                        {isOwner ? 'Chủ sở hữu' : 'Cộng tác viên'}
                      </span>
                    )}
                  </div>
                  <p className="small text-muted mb-2">
                    {story.category} · {story.total_chapters} chương · {story.status}
                  </p>
                  <p className="small mb-3 story-clamp">{story.description}</p>
                <div className="d-flex flex-wrap gap-2">
                  <Link to={`/story/${story.slug}`} className="btn-cmc btn-cmc-outline btn-sm">
                    Xem
                  </Link>

                  {user?.role === 'Admin' ? (
                    // Admin: đổi nút sửa thành ẩn truyện và có quyền tuyệt đối
                    <button
                      type="button"
                      className={`btn-cmc btn-sm ${story.is_published ? 'btn-cmc-outline' : 'btn-cmc-primary'}`}
                      onClick={() => handleToggleVisibility(story.id)}
                    >
                      {story.is_published ? 'Ẩn truyện' : 'Hiện truyện'}
                    </button>
                  ) : (
                    // Uploader: vẫn giữ nguyên nút sửa
                    <button
                      type="button"
                      className="btn-cmc btn-cmc-outline btn-sm"
                      onClick={() => openEdit(story)}
                    >
                      Sửa truyện
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-cmc btn-cmc-primary btn-sm"
                    onClick={() => openAddChapter(story)}
                  >
                    + Chương
                  </button>

                  {isOwner && (
                    <button
                      type="button"
                      className="btn-cmc btn-cmc-outline btn-sm"
                      onClick={() => openCollaborators(story)}
                    >
                      Cộng tác viên
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-cmc btn-cmc-outline btn-sm"
                    onClick={() => toggleChapterList(story.id)}
                  >
                    {expandedStory === story.id ? '▲ Ẩn chương' : '▼ Xem chương'}
                  </button>

                  {user?.role !== 'Admin' && (
                    story.hidden_by_admin ? (
                      <span 
                        className="badge-role" 
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.15)', 
                          color: '#ef4444', 
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'not-allowed'
                        }}
                        title="Truyện này đã bị Admin ẩn. Bạn không thể hiện lại."
                      >
                        🚫 Admin ẩn
                      </span>
                    ) : (
                      isOwner && (
                        <button
                          type="button"
                          className={`btn-cmc btn-sm ${
                            story.is_published ? 'btn-link-danger' : 'btn-cmc-primary'
                          }`}
                          onClick={() => handleToggleVisibility(story.id)}
                        >
                          {story.is_published ? 'Ẩn truyện' : 'Hiện truyện'}
                        </button>
                      )
                    )
                  )}
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
                              {isOwner && (
                                <button
                                  type="button"
                                  className="btn-link-danger btn-xs"
                                  onClick={() => deleteChapter(story, ch)}
                                >
                                  Xóa
                                </button>
                              )}
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
          );
        })}
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
      {/* ── Collaborators modal ────────────────────────────────────────────── */}
      {collabModalStory ? (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setCollabModalStory(null)}>
          <div className="modal-content">
            <button type="button" className="close-modal" onClick={() => setCollabModalStory(null)}>&times;</button>
            <h2 className="mb-3">Cộng tác viên — {collabModalStory.title}</h2>
            
            {collabError && <div className="alert-cmc alert-cmc-danger mb-3" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '6px' }}>{collabError}</div>}
            
            <form onSubmit={addCollaborator} className="d-flex gap-2 my-3">
              <input
                type="email"
                className="form-control-cmc flex-grow-1"
                placeholder="Nhập email của uploader..."
                value={newCollabEmail}
                onChange={(e) => setNewCollabEmail(e.target.value)}
                disabled={collabLoading}
                required
              />
              <button type="submit" className="btn-cmc btn-cmc-primary" disabled={collabLoading}>
                Thêm
              </button>
            </form>

            <div className="mt-3">
              <h5 className="mb-2">Danh sách thành viên</h5>
              {collabLoading && collabList.length === 0 ? (
                <p className="small text-muted">Đang tải...</p>
              ) : collabList.length === 0 ? (
                <p className="small text-muted">Chưa có cộng tác viên nào. Nhập email phía trên để thêm.</p>
              ) : (
                <ul className="list-unstyled d-grid gap-2" style={{ padding: 0 }}>
                  {collabList.map((collab) => (
                    <li key={collab.id} className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div className="d-flex align-items-center gap-2">
                        {collab.avatar_url ? (
                          <img src={collab.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                            {collab.username.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="small fw-semibold mb-0" style={{ fontSize: '0.9rem' }}>{collab.full_name || collab.username}</p>
                          <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>{collab.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-link-danger btn-xs"
                        onClick={() => removeCollaborator(collab.id)}
                        disabled={collabLoading}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        Gỡ
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default DashboardPage;
