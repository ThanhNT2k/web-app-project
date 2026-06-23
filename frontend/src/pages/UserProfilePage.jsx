import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import PasswordChecklist from '../components/PasswordChecklist';
import ReadingPreferencesPanel from '../components/ReadingPreferencesPanel';
import StoryCard from '../components/StoryCard';
import UserProfile from '../components/UserProfile';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';

function UserProfilePage() {
  const { user, refreshCurrentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [follows, setFollows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', avatar_url: '', bio: '' });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  // Change password
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const passwordValid =
    pwForm.newPassword.length >= 8 &&
    /[A-Z]/.test(pwForm.newPassword) &&
    /[0-9]/.test(pwForm.newPassword) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(pwForm.newPassword);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [historyRes, followsRes] = await Promise.all([
          API.readingHistory.getAll(),
          API.follows.getAll(),
        ]);
        setHistory(historyRes.history || []);
        setFollows(followsRes.stories || []);
      } catch {
        setHistory([]);
        setFollows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openEditModal = () => {
    setProfileForm({
      full_name: user?.full_name || '',
      avatar_url: user?.avatar_url || '',
      bio: user?.bio || '',
    });
    setMessage('');
    setEditModalOpen(true);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUpdating(true);
      const res = await API.upload.cover(file);
      setProfileForm((f) => ({ ...f, avatar_url: res.url }));
    } catch {
      setMessage('Tải ảnh lên thất bại.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    try {
      setUpdating(true);
      await API.auth.updateProfile(profileForm);
      await refreshCurrentUser();
      setEditModalOpen(false);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Không thể lưu hồ sơ.');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (!passwordValid) {
      setPwError('Mật khẩu mới chưa đáp ứng đủ các tiêu chí.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Xác nhận mật khẩu không khớp.');
      return;
    }
    try {
      setPwLoading(true);
      await API.auth.changePassword(pwForm);
      setPwSuccess('Mật khẩu đã được cập nhật thành công.');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err?.response?.data?.message || 'Không thể đổi mật khẩu.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <main className="cmc-main">
      <UserProfile user={user} onEditClick={openEditModal} />

      <div className="row g-4 mt-2">
        <div className="col-lg-7">
          <section className="panel-card">
            <h5 className="panel-title">Lịch sử đọc</h5>
            {loading ? <p className="text-muted small">Đang tải...</p> : null}
            {!loading && history.length === 0 ? (
              <p className="text-muted mb-0">Bạn chưa đọc truyện nào.</p>
            ) : null}
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item">
                  <div>
                    <Link to={`/story/${item.story_id}-${item.slug}`} className="fw-semibold">
                      {item.title}
                    </Link>
                    <div className="small text-muted">
                      {item.last_chapter_title
                        ? `Chương ${item.last_chapter_number}: ${item.last_chapter_title}`
                        : 'Đang đọc'}
                      {' · '}
                      {Math.round(item.completion_rate || 0)}%
                    </div>
                  </div>
                  {item.last_chapter_read ? (
                    <Link
                      className="btn-cmc btn-cmc-primary btn-sm"
                      to={`/${item.story_id}-${item.slug}/${item.last_chapter_number}`}
                    >
                      Tiếp tục
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="panel-card mt-4">
            <h5 className="panel-title">Truyện đang theo dõi</h5>
            {!loading && follows.length === 0 ? (
              <p className="text-muted mb-0">Chưa theo dõi truyện nào.</p>
            ) : null}
            <div className="stories-grid mt-3">
              {follows.map((story) => (
                <StoryCard key={story.id} story={story} compact />
              ))}
            </div>
          </section>
        </div>

        <div className="col-lg-5">
          <ReadingPreferencesPanel />
        </div>
      </div>

      {/* Profile Edit modal */}
      {editModalOpen ? (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditModalOpen(false)}>
          <div className="modal-content modal-content-md">
            <button type="button" className="close-modal" onClick={() => setEditModalOpen(false)}>&times;</button>
            <h2>Chỉnh sửa hồ sơ</h2>

            {/* Tabs */}
            <div className="profile-modal-tabs">
              <button
                type="button"
                className={`profile-modal-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => { setActiveTab('profile'); setMessage(''); }}
              >
                Thông tin
              </button>
              <button
                type="button"
                className={`profile-modal-tab ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => { setActiveTab('password'); setPwError(''); setPwSuccess(''); }}
              >
                Đổi mật khẩu
              </button>
            </div>

            {/* Tab: Thông tin */}
            {activeTab === 'profile' && (
              <>
                {message ? <div className="alert alert-danger mt-2 py-2 px-3 small">{message}</div> : null}

            <form onSubmit={handleSaveProfile} className="d-grid gap-3 mt-3">
              <div>
                <label className="small text-muted d-block mb-1 fw-bold">Tên hiển thị</label>
                <input
                  type="text"
                  className="form-control-cmc"
                  placeholder="Nhập tên hiển thị..."
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="small text-muted d-block mb-1 fw-bold">Giới thiệu bản thân</label>
                <textarea
                  className="form-control-cmc"
                  rows={3}
                  placeholder="Viết vài dòng giới thiệu về bản thân..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                />
              </div>

              <div>
                <label className="small text-muted d-block mb-1 fw-bold">Ảnh đại diện (Avatar)</label>
                <div className="d-flex align-items-center gap-3">
                  {profileForm.avatar_url ? (
                    <img
                      src={profileForm.avatar_url}
                      alt="Preview"
                      className="rounded-circle"
                      style={{ width: '60px', height: '60px', objectFit: 'cover', border: '2px solid var(--border)' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-brand text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: '60px', height: '60px', fontSize: '1.2rem' }}
                    >
                      {(profileForm.full_name || user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-grow-1">
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={updating} style={{ fontSize: '0.85rem' }} />
                    <input
                      type="text"
                      className="form-control-cmc mt-2"
                      placeholder="Hoặc dán URL ảnh đại diện vào đây..."
                      value={profileForm.avatar_url}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-cmc btn-cmc-primary w-100 mt-2" disabled={updating}>
                {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
              </>
            )}

            {/* Tab: Đổi mật khẩu */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="d-grid gap-3 mt-3">
                {pwError ? <div className="alert alert-danger py-2 px-3 small">{pwError}</div> : null}
                {pwSuccess ? <div className="alert alert-success py-2 px-3 small">{pwSuccess}</div> : null}

                <div>
                  <label className="small text-muted d-block mb-1 fw-bold">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    className="form-control-cmc"
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu cũ..."
                    value={pwForm.oldPassword}
                    onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="small text-muted d-block mb-1 fw-bold">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-control-cmc"
                    autoComplete="new-password"
                    placeholder="Nhập mật khẩu mới..."
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    required
                  />
                  <PasswordChecklist password={pwForm.newPassword} />
                </div>

                <div>
                  <label className="small text-muted d-block mb-1 fw-bold">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-control-cmc"
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu mới..."
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-cmc btn-cmc-primary w-100 mt-2"
                  disabled={pwLoading || !passwordValid}
                >
                  {pwLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default UserProfilePage;
