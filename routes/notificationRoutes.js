const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
// FIX: إضافة protect — كانت routes مفتوحة بدون أي حماية
const protect = require('../middlewares/authMiddleware');

// GET /api/notifications
router.get('/', protect, notificationController.getNotifications);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', protect, notificationController.markAsRead);

module.exports = router;