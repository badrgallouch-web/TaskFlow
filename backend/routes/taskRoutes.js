const express = require('express');

const router = express.Router();

const taskController = require('../controllers/taskController');

const protect = require('../middlewares/authMiddleware');

const {
    validateTask,
    validateStatus
} = require('../middlewares/validateTask');

router.get('/', protect, taskController.getAllTasks);

router.get('/my-tasks/:userId', protect, taskController.getMyTasks);

router.post('/', protect, validateTask, taskController.createTask);

router.get('/:id', protect, taskController.getTaskById);

router.put('/:id', protect, validateTask, taskController.updateTask);

router.delete('/:id', protect, taskController.deleteTask);

router.patch('/:id/status', protect, validateStatus, taskController.updateTaskStatus);

router.patch('/:id/assign', protect, taskController.assignTask);

module.exports = router;