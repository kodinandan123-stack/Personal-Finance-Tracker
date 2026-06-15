const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
} = require('../controllers/notificationController');

// GET    /api/notifications           - Fetch all notifications (with unread count)
router.get('/', protect, getNotifications);

// PATCH  /api/notifications/read-all  - Mark all notifications as read
router.patch('/read-all', protect, markAllAsRead);

// DELETE /api/notifications/clear-read - Delete all read notifications
router.delete('/clear-read', protect, clearReadNotifications);

// PATCH  /api/notifications/:id/read  - Mark a single notification as read
router.patch('/:id/read', protect, markAsRead);

// DELETE /api/notifications/:id       - Delete a single notification
router.delete('/:id', protect, deleteNotification);

module.exports = router;
