const Notification = require('../models/Notification');

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Notifications retrieved successfully',
      unreadCount: notifications.filter((n) => !n.read).length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      read: false,
    });

    res.status(200).json({
      message: 'Notification marked as read',
      data: notification,
      unreadCount,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating notification', error: error.message });
  }
};
