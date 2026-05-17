const Notification = require('../models/Notification');
/**
 * Crée une notification en base de données
 * @param {Object} options
 * @param {string} options.userId     - ID de l'utilisateur à notifier
 * @param {string} options.type       - task_assigned | status_changed | member_added
 * @param {string} options.message    - Message lisible
 * @param {string} options.projectId  - ID du projet concerné
 */
const createNotification = async ({ userId = 'system', type, message, projectId }) => {
    try {
        await Notification.create({
            user: userId,
            project: projectId,
            type,
            message
        });
    } catch (err) {
        console.error('Failed to create notification:', err.message);
    }
};

module.exports = { createNotification };