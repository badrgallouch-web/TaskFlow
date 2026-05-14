const express = require('express');

const router = express.Router();

const taskController = require('../controllers/taskController');

const {
    validateTask,
    validateStatus
} = require('../middlewares/validateTask');

router.get('/', taskController.getAllTasks);

router.post('/', validateTask, taskController.createTask);

router.get('/:id', taskController.getTaskById);

router.put('/:id', validateTask, taskController.updateTask);

router.delete('/:id', taskController.deleteTask);

router.patch('/:id/status', validateStatus, taskController.updateTaskStatus);

module.exports = router;