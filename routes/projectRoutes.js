const express = require('express');
const router  = express.Router();
const projectController = require('../controllers/projectController');
const taskController    = require('../controllers/taskController');
const protect           = require('../middlewares/authMiddleware');
const Project           = require('../models/Project');

// CRUD المشاريع
router.get('/',       protect, projectController.getProjects);
router.post('/',      protect, projectController.addProject);
router.put('/:id',    protect, projectController.updateProject);
router.delete('/:id', protect, projectController.removeProject);

// GET /api/projects/:id/tasks — مهام المشروع (فلترة + بحث + pagination)
router.get('/:id/tasks', protect, taskController.getTasksByProject);

// GET /api/projects/:id/members — قائمة أعضاء المشروع
router.get('/:id/members', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('members', 'fullName email');

        if (!project) {
            return res.status(404).json({ message: 'Projet introuvable' });
        }

        // FIX: التحقق أن الطالب عضو أو مالك قبل إعادة القائمة
        const userId = req.user.id;
        const isMember = project.members.some(m => m._id.toString() === userId);
        const isOwner  = project.owner.toString() === userId;

        if (!isMember && !isOwner) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        res.status(200).json({ members: project.members });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
