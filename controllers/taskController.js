const Task = require('../models/Task');
const { logActivity } = require('../services/activityLogger');
const { createNotification } = require('../services/notificationLogger');

exports.getAllTasks = async (req, res) => {
    try {
        const filter = {};
        if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

        const tasks = await Task.find(filter).populate('assignedTo', 'fullName email');
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('assignedTo', 'fullName email');
        if (!task) return res.status(404).json({ msg: 'Tâche introuvable' });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { title, priority, status, projectId, dueDate, assignedTo } = req.body;
        const newTask = await Task.create({ title, priority, status, projectId, dueDate, assignedTo });

        // المحاولة بصمت حتى لا يتعطل إنشاء المهمة إذا فشل السجل
        try {
            await logActivity({
                actionType: 'task_created',
                projectId,
                userId: req.user?.id,
                description: `Tâche "${title}" a été créée`,
                metadata: { taskId: newTask._id, title, priority, status }
            });
        } catch(e) { console.warn("Log activity failed", e.message); }

        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedTask) return res.status(404).json({ msg: 'Tâche introuvable' });

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ msg: 'Tâche introuvable' });
        res.status(200).json({ msg: 'Tâche supprimée' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// الدالة المسؤولة عن تحديث الحالة من لوحة التحكم (مصلحة بالكامل)
exports.updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Tâche introuvable' });

        const oldStatus = task.status;
        const newStatus = req.body.status ? req.body.status.trim().toLowerCase() : '';

        // تأمين مقارنة الصلاحيات
        const assignedToId = task.assignedTo ? task.assignedTo.toString() : null;
        const userId = req.user.id ? req.user.id.toString() : null;

        if (assignedToId && userId && assignedToId !== userId) {
            return res.status(403).json({ msg: 'Vous ne pouvez modifier que vos tâches assignées' });
        }

        // FIX: استخدام findByIdAndUpdate لتحديث وفحص حقل الحالة (status) فقط
        // هذا يمنع Mongoose من الانهيار إذا كانت المهمة تحتوي قديماً على أولوية خاطئة مثل "medium"
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: { status: newStatus } },
            { new: true, runValidators: true, context: 'query' }
        );

        // نظام الإشعارات والسجلات
        try {
            await logActivity({
                actionType: 'task_status_changed',
                projectId: updatedTask.projectId,
                userId: req.user?.id,
                description: `Statut de "${updatedTask.title}" changé de "${oldStatus}" à "${newStatus}"`,
                metadata: { taskId: updatedTask._id, oldStatus, newStatus }
            });

            if (task.assignedTo) {
                await createNotification({
                    userId: task.assignedTo.toString(),
                    type: 'status_changed',
                    message: `Statut de "${updatedTask.title}" changé de "${oldStatus}" à "${newStatus}"`,
                    projectId: updatedTask.projectId
                });
            }
        } catch (logError) {
            console.warn("Log/Notification failed, but task updated:", logError.message);
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(400).json({ msg: error.message });
    }
};

exports.getTasksByProject = async (req, res) => {
    try {
        const { search, status, priority, assignedTo, page = 1, limit = 5 } = req.query;
        const filter = { projectId: req.params.id };
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const total = await Task.countDocuments(filter);
        const tasks = await Task.find(filter)
            .populate('assignedTo', 'fullName email')
            .sort({ priority: -1, dueDate: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({ data: tasks, total, page: parseInt(page), totalPages: Math.ceil(total / limit) || 1 });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};