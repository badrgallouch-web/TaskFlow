const Notification = require('../models/Notification');

// GET /api/notifications
exports.getNotifications = async (req, res) => {
    try {
        // FIX: استخدام user: req.user.id ليطابق الـ model (الحقل اسمه user وليس userId)
        // كل مستخدم يرى إشعاراته الخاصة فقط
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Notifications retrieved successfully',
            unreadCount: notifications.filter(n => !n.read).length,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({
            message: 'Notification marked as read',
            data: notification
        });
    } catch (error) {
        res.status(400).json({ message: 'Error updating notification', error: error.message });
    }
};