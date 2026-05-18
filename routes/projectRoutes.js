const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const protect = require('../middlewares/authMiddleware');

router.get('/', protect, projectController.getProjects);
router.post('/add', protect, projectController.addProject);
router.put('/update/:id', protect, projectController.updateProject);
router.delete('/delete/:id', protect, projectController.removeProject);

module.exports = router;