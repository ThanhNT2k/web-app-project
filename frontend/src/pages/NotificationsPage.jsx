import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import IconBadge from '../components/IconBadge';
import API from '../services/api';
import {
  FontAwesomeIcon,
  faArrowLeft,
  faArrowRight,
  faBell,
  faBookOpen,
  faCheck,
  faCircleInfo,
  faEnvelopeOpenText,
  faGear,
  faTrash,
  faXmark,
} from '../lib/icons';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const limit = 20;

  useEffect(() => {
    fetchNotifications();
  }, [page, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.notifications.getAll(page, limit);
      let notifs = res.data || [];

      // Apply filter
      if (filter === 'unread') {
        notifs = notifs.filter((n) => !n.is_read);
      } else if (filter === 'read') {
        notifs = notifs.filter((n) => n.is_read);
      }

      setNotifications(notifs);
      setTotal(res.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    const previous = notifications;
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, is_read: true } : item));
    try {
      await API.notifications.markAsRead(id);
    } catch (error) {
      setNotifications(previous);
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const previous = notifications;
    setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));
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
    } catch (error) {
      setNotifications(previous);
      setTotal(previousTotal);
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tất cả thông báo?')) return;
    const previous = notifications;
    const previousTotal = total;
    setNotifications([]);
    setTotal(0);
    try {
      await API.notifications.deleteAll();
    } catch (error) {
      setNotifications(previous);
      setTotal(previousTotal);
      console.error('Error deleting all notifications:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const pages = Math.ceil(total / limit);

  return (
    <main className="notifications-page min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="page-title-with-icon text-3xl font-bold text-gray-900 dark:text-white mb-2">
            <IconBadge icon={faBell} size="md" tone="primary" />
            Thông báo
          </h1>
          <p className="notifications-page-subtitle">
            Quản lý và xem toàn bộ thông báo của bạn
          </p>
        </div>

        {/* Stats */}
        {total > 0 && (
          <div className="notifications-summary rounded-lg p-4 mb-6 flex justify-between items-center">
            <div>
              <p className="notifications-page-subtitle">
                Tổng thông báo: <span className="font-bold">{total}</span>
              </p>
              {unreadCount > 0 && (
                <p className="text-blue-600 dark:text-blue-400">
                  Chưa đọc: <span className="font-bold">{unreadCount}</span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="notifications-page-action px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  Đánh dấu tất cả đã đọc
                </button>
              )}
              <button
                onClick={handleDeleteAll}
                className="notifications-page-action px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                <FontAwesomeIcon icon={faTrash} />
                Xóa tất cả
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="notifications-filter-panel rounded-lg p-4 mb-6 flex gap-4">
          <button
            onClick={() => {
              setFilter('all');
              setPage(1);
            }}
            className={`notifications-filter-button px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'is-active'
                : ''
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => {
              setFilter('unread');
              setPage(1);
            }}
            className={`notifications-filter-button px-4 py-2 rounded-lg transition-colors ${
              filter === 'unread'
                ? 'is-active'
                : ''
            }`}
          >
            Chưa đọc
          </button>
          <button
            onClick={() => {
              setFilter('read');
              setPage(1);
            }}
            className={`notifications-filter-button px-4 py-2 rounded-lg transition-colors ${
              filter === 'read'
                ? 'is-active'
                : ''
            }`}
          >
            Đã đọc
          </button>
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="loading-text text-center py-12">
            <p className="notifications-page-subtitle">Đang tải thông báo...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty text-center py-12 rounded-lg">
            <p className="notifications-page-subtitle text-lg">
              {filter === 'all'
                ? 'Chưa có thông báo nào'
                : filter === 'unread'
                  ? 'Không có thông báo chưa đọc'
                  : 'Không có thông báo đã đọc'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notification-page-item p-4 rounded-lg border-l-4 transition-all ${
                  notif.is_read
                    ? 'is-read'
                    : 'is-unread'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    {notif.link ? (
                      <Link
                        to={notif.link}
                        className="text-blue-600 dark:text-blue-400 hover:underline block mb-2"
                      >
                        <h3 className="notification-page-message font-semibold">
                          {notif.message}
                        </h3>
                      </Link>
                    ) : (
                      <h3 className="notification-page-message font-semibold mb-2">
                        {notif.message}
                      </h3>
                    )}
                    <p className="notifications-page-subtitle text-sm">
                      {formatDate(notif.created_at)}
                    </p>
                    {notif.type && (
                      <span className="notifications-type-badge inline-flex mt-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded">
                        {notif.type === 'new_chapter' ? (
                          <>
                            <FontAwesomeIcon icon={faBookOpen} /> Chương mới
                          </>
                        ) : notif.type === 'system' ? (
                          <>
                            <FontAwesomeIcon icon={faGear} /> Hệ thống
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCircleInfo} /> Thông báo
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="notifications-page-action px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      title="Mark as read"
                    >
                        <FontAwesomeIcon icon={faCheck} />
                    </button>
                  )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="notifications-page-action px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    title="Delete"
                  >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="notifications-pagination mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="notifications-page-action px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Trước
            </button>

            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`notifications-page-number px-4 py-2 rounded-lg transition-colors ${
                  p === page
                    ? 'is-active'
                    : ''
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages}
              className="notifications-page-action px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Sau
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        )}

        {/* Link to preferences */}
        <div className="mt-8 text-center">
          <Link
            to="/settings/notifications"
            className="notifications-page-action text-blue-600 dark:text-blue-400 hover:underline"
          >
            <FontAwesomeIcon icon={faEnvelopeOpenText} />
            Quản lý cài đặt thông báo
          </Link>
        </div>
      </div>
    </main>
  );
}

export default NotificationsPage;
