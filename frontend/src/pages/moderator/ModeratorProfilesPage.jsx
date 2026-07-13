import { useCallback, useEffect, useState } from 'react';

import API from '../../services/api';

const STATUS_LABELS = {
  NEW: 'Mới',
  IN_PROGRESS: 'Đang xem xét',
  RESOLVED: 'Đã xử lý',
  DISMISSED: 'Đã bác bỏ',
};

const STATUS_FILTERS = [
  ['', 'Tất cả'],
  ...Object.entries(STATUS_LABELS),
];

const RESOLUTION_LABELS = {
  REMOVE_REPORTED_AVATAR: 'Đã gỡ avatar',
  KEEP_AVATAR: 'Đã giữ avatar và bác báo cáo',
  DISMISS: 'Đã bác báo cáo',
  RESOLVE_NO_ACTION: 'Đã hoàn tất, không thay đổi avatar',
  START_REVIEW: 'Đã đưa vào xem xét',
};

function ModeratorProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [status, setStatus] = useState('NEW');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [actions, setActions] = useState({});
  const [notes, setNotes] = useState({});
  const [error, setError] = useState('');

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.moderator.getProfiles(status || undefined);
      setProfiles(response.profiles || []);
    } catch {
      setError('Không thể tải danh sách profile được báo cáo.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const handleProcess = async (profile) => {
    const action = actions[profile.id];
    if (!action) return;
    if (action === 'REMOVE_AVATAR' && !window.confirm(`Gỡ avatar của @${profile.username}?`)) return;

    try {
      setProcessingId(profile.id);
      await API.moderator.processProfileAvatar(profile.id, action, notes[profile.id] || '');
      setActions((current) => ({ ...current, [profile.id]: '' }));
      setNotes((current) => ({ ...current, [profile.id]: '' }));
      await loadProfiles();
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể xử lý avatar lúc này.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="management-page profiles-workspace">
      <header className="management-page-header">
        <div>
          <p className="management-eyebrow">AN TOÀN CỘNG ĐỒNG</p>
          <h2>Quản lý profile</h2>
          <p>Kiểm tra avatar bị báo cáo và áp dụng phương án xử lý phù hợp.</p>
        </div>
        <button type="button" onClick={loadProfiles} disabled={loading}>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </header>

      <div className="profiles-filter-row">
        <span>Trạng thái báo cáo</span>
        <div className="profiles-status-filters" role="tablist" aria-label="Lọc trạng thái báo cáo profile">
          {STATUS_FILTERS.map(([value, label]) => (
            <button
              type="button"
              role="tab"
              aria-selected={status === value}
              className={status === value ? 'active' : ''}
              key={value || 'ALL'}
              onClick={() => setStatus(value)}
              disabled={loading && status === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}
      {!loading && profiles.length === 0 ? (
        <div className="reports-empty-state"><strong>Không có profile phù hợp bộ lọc</strong><span>Các báo cáo avatar sẽ xuất hiện tại đây.</span></div>
      ) : null}

      <div className="profile-moderation-grid" aria-busy={loading}>
        {profiles.map((profile) => {
          const displayName = profile.full_name || profile.username;
          const selectedAction = actions[profile.id] || '';
          const isFinalStatus = ['RESOLVED', 'DISMISSED'].includes(profile.latest_status);
          return (
            <article className="profile-moderation-card" key={profile.id}>
              <div className="profile-moderation-summary">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={`Avatar của ${displayName}`} />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
                <div>
                  <h3>{displayName}</h3>
                  <p>@{profile.username} · {profile.report_count} báo cáo</p>
                  <small>{STATUS_LABELS[profile.latest_status] || profile.latest_status}</small>
                </div>
              </div>

              <div className="profile-moderation-controls">
                {isFinalStatus ? (
                  <div className="profile-resolution-result">
                    <span>Kết quả xử lý</span>
                    <strong>{RESOLUTION_LABELS[profile.latest_resolution_action] || profile.latest_resolution_action || 'Đã hoàn tất'}</strong>
                    {profile.latest_resolution_note ? <p>{profile.latest_resolution_note}</p> : null}
                    <small>
                      {profile.latest_resolver_full_name || profile.latest_resolver_username
                        ? `Bởi ${profile.latest_resolver_full_name || profile.latest_resolver_username}`
                        : 'Không có thông tin người xử lý'}
                      {profile.latest_resolved_at
                        ? ` · ${new Date(profile.latest_resolved_at).toLocaleString('vi-VN')}`
                        : ''}
                    </small>
                  </div>
                ) : null}
                {!isFinalStatus ? (
                  <>
                    <label htmlFor={`profile-action-${profile.id}`}>Phương án xử lý avatar</label>
                    <select
                      id={`profile-action-${profile.id}`}
                      value={selectedAction}
                      onChange={(event) => setActions((current) => ({ ...current, [profile.id]: event.target.value }))}
                    >
                      <option value="">Chọn phương án...</option>
                      <option value="START_REVIEW">Đưa vào xem xét</option>
                      <option value="REMOVE_AVATAR">Gỡ avatar</option>
                      <option value="KEEP_AVATAR">Giữ avatar và bác báo cáo</option>
                    </select>
                    <textarea
                      rows={2}
                      maxLength={500}
                      placeholder="Ghi chú xử lý (không bắt buộc)"
                      value={notes[profile.id] || ''}
                      onChange={(event) => setNotes((current) => ({ ...current, [profile.id]: event.target.value }))}
                    />
                    <button type="button" disabled={!selectedAction || processingId === profile.id} onClick={() => handleProcess(profile)}>
                      {processingId === profile.id ? 'Đang xử lý...' : 'Áp dụng'}
                    </button>
                  </>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ModeratorProfilesPage;
