// FIX: كان يستدعي ../models/Activitycontroller (خطأ) — الصح هو ../models/Activity
const Activity = require('../models/Activity');

/**
 * Log an activity event to MongoDB
 * @param {Object} options
 * @param {string} options.actionType  - One of: task_created, task_deleted, task_status_changed, member_added, member_removed, project_updated
 * @param {string} options.projectId  - The project ObjectId
 * @param {string} options.userId     - The user performing the action
 * @param {string} options.description - Human-readable message
 * @param {Object} options.metadata   - Extra data (optional)
 */
const logActivity = async ({ actionType, projectId, userId, description, metadata = {} }) => {
    try {
        // FIX: لا نحفظ إذا userId غير موجود لأن الـ model يشترطه (required: true)
        if (!userId || !projectId) {
            console.warn('logActivity: userId or projectId missing, skipping log');
            return;
        }

        await Activity.create({
            type: actionType,
            project: projectId,
            user: userId,
            meta: {
                description,
                ...metadata
            }
        });

    } catch (err) {
        // Ne pas bloquer l'action principale si le log échoue
        console.error('Failed to log activity:', err.message);
    }
};

module.exports = { logActivity };