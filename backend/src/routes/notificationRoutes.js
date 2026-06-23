const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// GET notifications - get all user notifications with pagination
router.get('/', authenticateToken, (req, res) => notificationController.getNotifications(req, res));

// GET unread count - get number of unread notifications
router.get('/unread-count', authenticateToken, (req, res) => notificationController.getUnreadCount(req, res));

// PATCH mark as read - mark single notification as read
router.patch('/:id/read', authenticateToken, (req, res) => notificationController.markAsRead(req, res));

// PATCH mark all as read - mark all user notifications as read
router.patch('/read-all', authenticateToken, (req, res) => notificationController.markAllAsRead(req, res));

// DELETE notification - delete single notification
router.delete('/:id', authenticateToken, (req, res) => notificationController.deleteNotification(req, res));

// DELETE all notifications - delete all user notifications
router.delete('/', authenticateToken, (req, res) => notificationController.deleteAllNotifications(req, res));

// GET preferences - get user's notification preferences
router.get('/preferences/me', authenticateToken, (req, res) => notificationController.getPreferences(req, res));

// PATCH preferences - update user's notification preferences
router.patch('/preferences/me', authenticateToken, (req, res) => notificationController.updatePreferences(req, res));

module.exports = router;
