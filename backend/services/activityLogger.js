const Activity = require('../models/Activity');

/**
 * Log an activity event to MongoDB.
 */
const logActivity = async ({ actionType, projectId, userId, description, metadata = {} }) => {
  if (!projectId || !userId) {
    return;
  }

  try {
    await Activity.create({
      type: actionType,
      project: projectId,
      user: userId,
      meta: {
        description,
        ...metadata,
      },
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

module.exports = { logActivity };
