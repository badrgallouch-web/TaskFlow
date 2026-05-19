// services/notificationLogger.js
const Notification = require('../models/Notification');

/**
 * إنشاء إشعار جديد
 * @param {Object} options
 * @param {string} options.userId   - معرّف المستخدم المستهدف
 * @param {string} options.type     - نوع الإشعار (task_assigned | status_changed | member_added | member_removed)
 * @param {string} options.message  - نص الإشعار
 * @param {string} [options.projectId] - معرّف المشروع (اختياري)
 */
async function createNotification({ userId, type, message, projectId }) {
    try {
        await Notification.create({
            user:    userId,
            type:    type,
            message: message,
            project: projectId || null,
            read:    false
        });
    } catch (err) {
        // لا نوقف العملية الأصلية إذا فشل الإشعار
        console.error('Notification error:', err.message);
    }
}

module.exports = { createNotification };
