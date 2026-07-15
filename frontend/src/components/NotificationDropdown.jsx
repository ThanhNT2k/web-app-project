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
    const previous = notifications;
    const unreadDelta = notifications.some((item) => item.id === id && !item.is_read) ? 1 : 0;
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, is_read: true } : item));
    try {
      await API.notifications.markAsRead(id);
      const res = await API.notifications.getUnreadCount();
      onUnreadCountChange(res.data?.unread_count || 0);
    } catch (error) {
      setNotifications(previous);
      if (unreadDelta) {
        API.notifications.getUnreadCount()
          .then((res) => onUnreadCountChange(res.data?.unread_count || 0))
          .catch(() => {});
      }
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const previous = notifications;
    setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));
    onUnreadCountChange(0);
    try {
      await API.notifications.markAllAsRead();
    } catch (error) {
      setNotifications(previous);
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    const previous = notifications;
    const previousTotal = total;
    setNotifications((items) => items.filter((item) => item.id !== id));
    setTotal((value) => Math.max(0, value - 1));
    try {
      await API.notifications.delete(id);
      // Refresh unread count
      const res = await API.notifications.getUnreadCount();
      onUnreadCountChange(res.data?.unread_count || 0);
    } catch (error) {
      setNotifications(previous);
      setTotal(previousTotal);
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
    <div className="notification-dropdown absolute right-0 mt-2 w-80 rounded-lg shadow-xl z-50 border">
      {/* Header */}
      <div className="notification-dropdown-header p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Thông báo
        </h3>
        {total > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="notification-dropdown-link text-sm"
          >
            Đánh dấu tất cả
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="notification-dropdown-list divide-y max-h-96 overflow-y-auto">
        {loading ? (
          <div className="notification-dropdown-empty loading-text p-4 text-center">
            <span className="text-sm">Đang tải...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-dropdown-empty p-4 text-center">
            <span className="text-sm">Chưa có thông báo nào</span>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-dropdown-item p-3 transition-colors cursor-pointer ${
                !notif.is_read ? 'is-unread' : 'is-read'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  {notif.link ? (
                    <Link
                      to={notif.link}
                      onClick={onClose}
                      className="notification-dropdown-message text-sm break-words"
                    >
                      {notif.message}
                    </Link>
                  ) : (
                    <p className="notification-dropdown-message text-sm break-words">
                      {notif.message}
                    </p>
                  )}
                  <p className="notification-dropdown-date text-xs mt-1">
                    {formatDate(notif.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="notification-dropdown-icon-action p-1"
                      title="Mark as read"
                    >
                      <FontAwesomeIcon className="w-4 h-4" icon={faCheck} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="notification-dropdown-icon-action is-delete p-1"
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
        <div className="notification-dropdown-footer p-4 border-t text-center">
          <Link
            to="/notifications"
            onClick={onClose}
            className="notification-dropdown-link text-sm font-medium"
          >
            Xem tất cả thông báo ({total})
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
