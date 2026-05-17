const Activity = require('../models/Activity');

/**
 * Log an activity event to MongoDB
 * @param {Object} options
 * @param {string} options.actionType  - One of: task_created, task_deleted, task_status_changed, member_added, member_removed, project_updated
 * @param {string} options.projectId  - The project ObjectId
 * @param {string} options.userId     - The user performing the action (default: 'system')
 * @param {string} options.description - Human-readable message
 * @param {Object} options.metadata   - Extra data (optional)
 */
const logActivity = async ({ actionType, projectId, userId = 'system', description, metadata = {} }) => {
    try {
        await Activity.create({ actionType, projectId, userId, description, metadata });
    } catch (err) {
        // Ne pas bloquer l'action principale si le log échoue
        console.error('Failed to log activity:', err.message);
    }
};

module.exports = { logActivity };