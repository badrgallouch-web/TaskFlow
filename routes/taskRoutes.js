const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/project/:projectId', taskController.getTasksByProject);
router.post('/', taskController.addTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;