const Joi = require('joi');
const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');

// Validation schemas
const notificationPreferenceSchema = Joi.object({
  email_new_chapter: Joi.boolean().optional(),
  push_new_chapter: Joi.boolean().optional(),
  email_system: Joi.boolean().optional(),
  push_system: Joi.boolean().optional(),
});

/**
 * Lấy danh sách thông báo của người dùng hiện tại.
 * Hỗ trợ phân trang qua query params: ?page=1&limit=10
 * GET /api/notifications
 */
async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50); // Tối đa 50
    const offset = (page - 1) * limit;

    const data = await Notification.getNotifications(userId, limit, offset);

    res.json({
      success: true,
      data: data.notifications,
      pagination: {
        page,
        limit,
        total: data.total,
        pages: Math.ceil(data.total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
}

/**
 * Lấy số thông báo chưa đọc của người dùng hiện tại.
 * GET /api/notifications/unread-count
 */
async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;
    const count = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unread_count: count },
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
}

/**
 * Đánh dấu một thông báo là đã đọc.
 * PATCH /api/notifications/:id/read
 */
async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.getNotificationById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Chỉ cho phép người dùng đánh dấu thông báo của chính mình
    if (notification.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updated = await Notification.markAsRead(id);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
}

/**
 * Đánh dấu tất cả thông báo là đã đọc.
 * PATCH /api/notifications/read-all
 */
async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;
    const count = await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      data: { marked_count: count },
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications as read' });
  }
}

/**
 * Xóa một thông báo.
 * DELETE /api/notifications/:id
 */
async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.getNotificationById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Chỉ cho phép người dùng xóa thông báo của chính mình
    if (notification.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Notification.deleteNotification(id);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
}

/**
 * Xóa tất cả thông báo.
 * DELETE /api/notifications
 */
async function deleteAllNotifications(req, res) {
  try {
    const userId = req.user.id;
    const count = await Notification.deleteAllNotifications(userId);

    res.json({
      success: true,
      data: { deleted_count: count },
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to delete all notifications' });
  }
}

/**
 * Lấy cài đặt thông báo của người dùng hiện tại.
 * GET /api/notification-preferences
 */
async function getPreferences(req, res) {
  try {
    const userId = req.user.id;
    let prefs = await NotificationPreference.getPreferences(userId);

    // Nếu chưa có cài đặt, tạo mặc định
    if (!prefs) {
      prefs = await NotificationPreference.createDefault(userId);
    }

    res.json({
      success: true,
      data: prefs,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notification preferences' });
  }
}

/**
 * Cập nhật cài đặt thông báo của người dùng hiện tại.
 * PATCH /api/notification-preferences
 */
async function updatePreferences(req, res) {
  try {
    const userId = req.user.id;
    const { error, value } = notificationPreferenceSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Đảm bảo cài đặt tồn tại
    let prefs = await NotificationPreference.getPreferences(userId);
    if (!prefs) {
      await NotificationPreference.createDefault(userId);
    }

    const updated = await NotificationPreference.updatePreferences(userId, value);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification preferences' });
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getPreferences,
  updatePreferences,
};
