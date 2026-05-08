const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.getProjects);
router.post('/add', projectController.addProject);
router.put('/update/:id', projectController.updateProject); 
router.delete('/delete/:id', projectController.removeProject);

module.exports = router;