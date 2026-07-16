import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import NotificationDropdown from './NotificationDropdown';
import { FontAwesomeIcon, faBell } from '../lib/icons';

function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread count periodically
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const res = await API.notifications.getUnreadCount();
        setUnreadCount(res.data?.unread_count || 0);
      } catch (error) {

      }
    };

    // Fetch immediately
    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="notification-bell-wrap" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="notification-bell-button"
        title="Thông báo"
        aria-label="Mở thông báo"
      >
        <FontAwesomeIcon className="notification-bell-icon" icon={faBell} />

        {unreadCount > 0 && (
          <span className="notification-bell-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <NotificationDropdown
          onClose={() => setShowDropdown(false)}
          onUnreadCountChange={setUnreadCount}
        />
      )}
    </div>
  );
}

export default NotificationBell;
