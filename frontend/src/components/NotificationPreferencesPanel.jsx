import { useEffect, useState } from 'react';
import IconBadge from './IconBadge';
import API from '../services/api';
import { faBell } from '../lib/icons';

function NotificationPreferencesPanel() {
  const [preferences, setPreferences] = useState({
    email_new_chapter: true,
    push_new_chapter: true,
    email_system: true,
    push_system: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const res = await API.notifications.getPreferences();
      setPreferences(res.data || preferences);
    } catch (error) {

      setMessage('Lỗi khi tải cài đặt thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await API.notifications.updatePreferences(preferences);
      setMessage('Cài đặt thông báo đã được lưu thành công');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {

      setMessage('Lỗi khi lưu cài đặt thông báo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <p className="text-gray-600 dark:text-gray-400">Đang tải cài đặt...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <h2 className="page-title-with-icon text-2xl font-bold text-gray-900 dark:text-white mb-6">
        <IconBadge icon={faBell} size="md" tone="primary" />
        Cài đặt Thông báo
      </h2>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('Lỗi')
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* New Chapter Notifications */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Chương mới
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Nhận thông báo khi các truyện bạn theo dõi có chương mới
        </p>

        <div className="space-y-3">
          {/* Email notification */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_new_chapter}
              onChange={() => handleToggle('email_new_chapter')}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
            />
            <span className="text-gray-900 dark:text-white">
              📧 Gửi qua Email
            </span>
          </label>

          {/* Push notification */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.push_new_chapter}
              onChange={() => handleToggle('push_new_chapter')}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
            />
            <span className="text-gray-900 dark:text-white">
              📬 Thông báo trên trang
            </span>
          </label>
        </div>
      </div>

      {/* System Notifications */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Thông báo hệ thống
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Thông báo về cập nhật, bảo trì, hoặc thông báo quan trọng từ hệ thống
        </p>

        <div className="space-y-3">
          {/* Email notification */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_system}
              onChange={() => handleToggle('email_system')}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
            />
            <span className="text-gray-900 dark:text-white">
              📧 Gửi qua Email
            </span>
          </label>

          {/* Push notification */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.push_system}
              onChange={() => handleToggle('push_system')}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
            />
            <span className="text-gray-900 dark:text-white">
              📬 Thông báo trên trang
            </span>
          </label>
        </div>
      </div>

      {/* Save button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
        <button
          onClick={fetchPreferences}
          disabled={saving || loading}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
        >
          Hoàn tác
        </button>
      </div>
    </div>
  );
}

export default NotificationPreferencesPanel;
