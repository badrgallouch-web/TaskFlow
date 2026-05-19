const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const protect = require('../middlewares/authMiddleware');
const { validateTask, validateStatus } = require('../middlewares/validateTask');
const Task = require('../models/Task');
const { createNotification } = require('../services/notificationLogger');

router.get('/', protect, taskController.getAllTasks);
router.post('/', protect, validateTask, taskController.createTask);
router.get('/:id', protect, taskController.getTaskById);
router.put('/:id', protect, validateTask, taskController.updateTask);
router.delete('/:id', protect, taskController.deleteTask);
router.patch('/:id/status', protect, validateStatus, taskController.updateTaskStatus);

router.patch('/:id/assign', protect, async (req, res) => {
    try {
        const { assignedTo } = req.body;
        if (!assignedTo) {
            return res.status(400).json({ message: 'assignedTo requis' });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { assignedTo },
            { new: true }
        ).populate('assignedTo', 'fullName email');

        if (!task) {
            return res.status(404).json({ message: 'Tâche introuvable' });
        }

        await createNotification({
            userId: assignedTo,
            type: 'task_assigned',
            message: `Tâche "${task.title}" vous a été assignée`,
            projectId: task.projectId
        });

        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;