import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { FontAwesomeIcon, faCheck, faXmark } from '../lib/icons';

function NotificationDropdown({ onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.notifications.getAll(page, limit);
      setNotifications(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await API.notifications.markAsRead(id);
      // Update local state
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      // Refresh unread count
      const res = await API.notifications.getUnreadCount();
      onUnreadCountChange(res.data?.unread_count || 0);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.notifications.markAllAsRead();
      // Refresh all notifications and count
      await fetchNotifications();
      const res = await API.notifications.getUnreadCount();
      onUnreadCountChange(res.data?.unread_count || 0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.notifications.delete(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      // Refresh unread count
      const res = await API.notifications.getUnreadCount();
      onUnreadCountChange(res.data?.unread_count || 0);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'vừa xong';
    if (diffMins < 60) return `${diffMins}m trước`;
    if (diffHours < 24) return `${diffHours}h trước`;
    if (diffDays < 7) return `${diffDays}d trước`;

    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Thông báo
        </h3>
        {total > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Đánh dấu tất cả
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            <span className="text-sm">Đang tải...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <span className="text-sm">Chưa có thông báo nào</span>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                !notif.is_read ? 'bg-blue-50 dark:bg-gray-700/50' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  {notif.link ? (
                    <Link
                      to={notif.link}
                      onClick={onClose}
                      className="text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 break-words"
                    >
                      {notif.message}
                    </Link>
                  ) : (
                    <p className="text-sm text-gray-900 dark:text-white break-words">
                      {notif.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(notif.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Mark as read"
                    >
                      <FontAwesomeIcon className="w-4 h-4" icon={faCheck} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete"
                  >
                    <FontAwesomeIcon className="w-4 h-4" icon={faXmark} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer with pagination */}
      {total > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <Link
            to="/notifications"
            onClick={onClose}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Xem tất cả thông báo ({total})
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
