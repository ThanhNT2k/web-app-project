import { useEffect, useState } from 'react';

import AccountSectionNav from '../components/AccountSectionNav';
import PasswordChecklist from '../components/PasswordChecklist';
import ReadingPreferencesPanel from '../components/ReadingPreferencesPanel';
import UserProfile from '../components/UserProfile';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';

function AccountSettingsPage() {
  const { user, refreshCurrentUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ full_name: '', avatar_url: '', bio: '' });
  const [profileState, setProfileState] = useState({ loading: false, error: '', success: '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordState, setPasswordState] = useState({ loading: false, error: '', success: '' });

  useEffect(() => {
    setProfileForm({
      full_name: user?.full_name || '',
      avatar_url: user?.avatar_url || '',
      bio: user?.bio || '',
    });
  }, [user]);

  const passwordValid =
    pwForm.newPassword.length >= 8 &&
    /[A-Z]/.test(pwForm.newPassword) &&
    /[0-9]/.test(pwForm.newPassword) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(pwForm.newPassword);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileState({ loading: true, error: '', success: '' });
    try {
      const response = await API.upload.cover(file);
      setProfileForm((current) => ({ ...current, avatar_url: response.url }));
      setProfileState({ loading: false, error: '', success: 'Ảnh đã tải lên. Hãy lưu thay đổi để cập nhật hồ sơ.' });
    } catch {
      setProfileState({ loading: false, error: 'Tải ảnh đại diện thất bại.', success: '' });
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setProfileState({ loading: true, error: '', success: '' });
    try {
      await API.auth.updateProfile(profileForm);
      await refreshCurrentUser();
      setProfileState({ loading: false, error: '', success: 'Hồ sơ đã được cập nhật.' });
    } catch (error) {
      setProfileState({
        loading: false,
        error: error?.response?.data?.message || 'Không thể lưu thay đổi hồ sơ.',
        success: '',
      });
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (!passwordValid) {
      setPasswordState({ loading: false, error: 'Mật khẩu mới chưa đáp ứng đủ các tiêu chí.', success: '' });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPasswordState({ loading: false, error: 'Xác nhận mật khẩu không khớp.', success: '' });
      return;
    }

    setPasswordState({ loading: true, error: '', success: '' });
    try {
      await API.auth.changePassword(pwForm);
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordState({ loading: false, error: '', success: 'Mật khẩu đã được cập nhật.' });
    } catch (error) {
      setPasswordState({
        loading: false,
        error: error?.response?.data?.message || 'Không thể đổi mật khẩu.',
        success: '',
      });
    }
  };

  return (
    <main className="cmc-main account-area">
      <header className="account-page-heading">
        <div>
          <span className="account-page-heading__eyebrow">Tủ sách &amp; Hồ sơ</span>
          <h1>Cài đặt tài khoản</h1>
          <p>Chỉnh sửa hồ sơ, tùy chọn đọc và thông tin bảo mật của bạn.</p>
        </div>
      </header>

      <AccountSectionNav />
      <UserProfile user={user} />

      <div className="account-settings-grid">
        <section className="panel-card account-settings-card">
          <div className="account-settings-card__heading">
            <div>
              <h2>Chỉnh sửa hồ sơ</h2>
              <p>Thông tin này sẽ hiển thị với những người dùng khác.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="account-settings-form">
            {profileState.error ? <div className="alert alert-danger mb-0">{profileState.error}</div> : null}
            {profileState.success ? <div className="alert alert-success mb-0">{profileState.success}</div> : null}

            <label className="account-field">
              <span>Tên hiển thị</span>
              <input
                type="text"
                className="form-control-cmc"
                value={profileForm.full_name}
                onChange={(event) => setProfileForm({ ...profileForm, full_name: event.target.value })}
                placeholder="Nhập tên hiển thị"
                required
              />
            </label>

            <label className="account-field">
              <span>Giới thiệu bản thân</span>
              <textarea
                className="form-control-cmc"
                rows={4}
                value={profileForm.bio}
                onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })}
                placeholder="Viết vài dòng giới thiệu về bạn..."
                maxLength={500}
              />
              <small>{profileForm.bio.length}/500 ký tự</small>
            </label>

            <div className="account-field">
              <span>Ảnh đại diện</span>
              <div className="account-avatar-editor">
                {profileForm.avatar_url ? (
                  <img src={profileForm.avatar_url} alt="Xem trước ảnh đại diện" />
                ) : (
                  <div className="account-avatar-editor__fallback">
                    {(profileForm.full_name || user?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={profileState.loading} />
                  <input
                    type="text"
                    className="form-control-cmc mt-2"
                    value={profileForm.avatar_url}
                    onChange={(event) => setProfileForm({ ...profileForm, avatar_url: event.target.value })}
                    placeholder="Hoặc dán URL ảnh đại diện"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-cmc btn-cmc-primary account-form-submit" disabled={profileState.loading}>
              {profileState.loading ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}
            </button>
          </form>
        </section>

        <div className="account-settings-side">
          <ReadingPreferencesPanel />

          <section className="panel-card account-settings-card">
            <div className="account-settings-card__heading">
              <div>
                <h2>Đổi mật khẩu</h2>
                <p>Sử dụng mật khẩu mạnh và không dùng lại ở nơi khác.</p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="account-settings-form">
              {passwordState.error ? <div className="alert alert-danger mb-0">{passwordState.error}</div> : null}
              {passwordState.success ? <div className="alert alert-success mb-0">{passwordState.success}</div> : null}
              <label className="account-field">
                <span>Mật khẩu hiện tại</span>
                <input type="password" className="form-control-cmc" autoComplete="current-password" value={pwForm.oldPassword} onChange={(event) => setPwForm({ ...pwForm, oldPassword: event.target.value })} required />
              </label>
              <label className="account-field">
                <span>Mật khẩu mới</span>
                <input type="password" className="form-control-cmc" autoComplete="new-password" value={pwForm.newPassword} onChange={(event) => setPwForm({ ...pwForm, newPassword: event.target.value })} required />
                <PasswordChecklist password={pwForm.newPassword} />
              </label>
              <label className="account-field">
                <span>Xác nhận mật khẩu mới</span>
                <input type="password" className="form-control-cmc" autoComplete="new-password" value={pwForm.confirmPassword} onChange={(event) => setPwForm({ ...pwForm, confirmPassword: event.target.value })} required />
              </label>
              <button type="submit" className="btn-cmc btn-cmc-outline account-form-submit" disabled={passwordState.loading || !passwordValid}>
                {passwordState.loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default AccountSettingsPage;
