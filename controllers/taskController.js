const Task = require('../models/Task');
const { logActivity } = require('../services/activityLogger');
const { createNotification } = require('../services/notificationLogger');

exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedTo', 'fullName email');
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

// تم إصلاح الدالة لتستقبل وتخزن حقل المسند إليه (assignedTo) تلقائياً دون مشاكل
exports.createTask = async (req, res) => {
    try {
        const { title, priority, status, projectId, dueDate, assignedTo } = req.body;

        const newTask = await Task.create({ 
            title, 
            priority, 
            status, 
            projectId, 
            dueDate, 
            assignedTo 
        });

        await logActivity({
            actionType: 'task_created',
            projectId,
            userId: req.user?.id,
            description: `Tâche "${title}" a été créée`,
            metadata: { taskId: newTask._id, title, priority, status }
        });

        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTask) return res.status(404).json({ msg: 'Tâche introuvable' });

        await logActivity({
            actionType: 'task_updated',
            projectId: updatedTask.projectId,
            userId: req.user?.id,
            description: `Tâche "${updatedTask.title}" a été modifiée`,
            metadata: { taskId: updatedTask._id, changes: req.body }
        });

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ msg: 'Tâche introuvable' });

        await logActivity({
            actionType: 'task_deleted',
            projectId: deletedTask.projectId,
            userId: req.user?.id,
            description: `Tâche "${deletedTask.title}" a été supprimée`,
            metadata: { taskId: deletedTask._id }
        });

        res.status(200).json({ msg: 'Tâche supprimée' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Tâche introuvable' });

        const oldStatus = task.status;

        if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Vous ne pouvez modifier que vos tâches assignées' });
        }

        task.status = req.body.status;
        const updatedTask = await task.save();

        await logActivity({
            actionType: 'task_status_changed',
            projectId: updatedTask.projectId,
            userId: req.user?.id,
            description: `Statut de "${updatedTask.title}" changé de "${oldStatus}" à "${req.body.status}"`,
            metadata: { taskId: updatedTask._id, oldStatus, newStatus: req.body.status }
        });

        await createNotification({
            userId: task.assignedTo?.toString(),
            type: 'status_changed',
            message: `Statut de "${updatedTask.title}" changé de "${oldStatus}" à "${req.body.status}"`,
            projectId: updatedTask.projectId
        });

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

exports.getTasksByProject = async (req, res) => {
    try {
        const { search, status, priority, assignedTo, page = 1, limit = 5 } = req.query;

        const filter = { projectId: req.params.id };
        if (status)     filter.status     = status;
        if (priority)   filter.priority   = priority;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (search)     filter.title      = { $regex: search, $options: 'i' };

        const total      = await Task.countDocuments(filter);
        const totalPages = Math.ceil(total / limit) || 1;
        const tasks      = await Task.find(filter)
            .populate('assignedTo', 'fullName email')
            .sort({ priority: -1, dueDate: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            data: tasks,
            total,
            page: parseInt(page),
            totalPages
        });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};