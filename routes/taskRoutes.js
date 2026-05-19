const express = require('express');
const router  = express.Router();
const taskController = require('../controllers/taskController');
const protect        = require('../middlewares/authMiddleware');
const { validateTask, validateStatus } = require('../middlewares/validateTask');
const Task = require('../models/Task');
const { createNotification } = require('../services/notificationLogger');

// CRUD المهام
router.get('/',      protect, taskController.getAllTasks);
router.post('/',     protect, validateTask, taskController.createTask);
router.get('/:id',   protect, taskController.getTaskById);
router.put('/:id',   protect, validateTask, taskController.updateTask);
router.delete('/:id', protect, taskController.deleteTask);

// PATCH /api/tasks/:id/status
router.patch('/:id/status', protect, validateStatus, taskController.updateTaskStatus);

// PATCH /api/tasks/:id/assign — تعيين مهمة لعضو
router.patch('/:id/assign', protect, async (req, res) => {
    try {
        const { assignedTo } = req.body;

        if (!assignedTo) {
            return res.status(400).json({ message: 'assignedTo est requis' });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { assignedTo },
            { new: true }
        ).populate('assignedTo', 'fullName email');

        if (!task) {
            return res.status(404).json({ message: 'Tâche introuvable' });
        }

        // إشعار للعضو المعيّن
        await createNotification({
            userId:    assignedTo,
            type:      'task_assigned',
            message:   `La tâche "${task.title}" vous a été assignée`,
            projectId: task.projectId
        });

        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
