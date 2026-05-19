const Notification = require('../models/Notification');

/**
 * Create a notification for a user.
 */
const createNotification = async ({ userId, type, message, projectId }) => {
  if (!userId || !type || !message) {
    return;
  }

  try {
    await Notification.create({
      user: userId,
      project: projectId,
      type,
      message,
    });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

module.exports = { createNotification };
