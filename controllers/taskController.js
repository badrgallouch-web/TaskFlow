const Task = require('../models/Task');
const { logActivity } = require('../services/activityLogger');

exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { title, priority, status, projectId } = req.body;

        const newTask = await Task.create({ title, priority, status, projectId });

        // 🔔 Log activity
        await logActivity({
            actionType: 'task_created',
            projectId,
            description: `Tâche "${title}" a été créée avec le statut "${status}"`,
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

        if (!updatedTask) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        // 🔔 Log activity
        await logActivity({
            actionType: 'task_status_changed',
            projectId: updatedTask.projectId,
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

        if (!deletedTask) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        // 🔔 Log activity
        await logActivity({
            actionType: 'task_deleted',
            projectId: deletedTask.projectId,
            description: `Tâche "${deletedTask.title}" a été supprimée`,
            metadata: { taskId: deletedTask._id, title: deletedTask.title }
        });

        res.status(200).json({ msg: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const oldTask = await Task.findById(req.params.id);
        if (!oldTask) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        const oldStatus = oldTask.status;

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        // 🔔 Log activity
        await logActivity({
            actionType: 'task_status_changed',
            projectId: updatedTask.projectId,
            description: `Statut de "${updatedTask.title}" changé de "${oldStatus}" à "${req.body.status}"`,
            metadata: { taskId: updatedTask._id, oldStatus, newStatus: req.body.status }
        });

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

exports.getTasksByProject = async (req, res) => {
    try {
        const tasks = await Task.find({ projectId: req.params.id });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};