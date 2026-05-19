const Project = require('../models/Project');
const { logActivity } = require('../services/activityLogger');

// FIX 1: تصفية المشاريع بالمستخدم المصادق + pagination
exports.getProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // المستخدم يرى مشاريعه كمالك أو كعضو
        const filter = {
            $or: [
                { owner: req.user.id },
                { members: req.user.id }
            ]
        };

        const total = await Project.countDocuments(filter);
        const projects = await Project.find(filter)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            data: projects,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch projects from database' });
    }
};

exports.addProject = async (req, res) => {
    try {
        const { projectName, description, endDate } = req.body;

        const newProject = new Project({
            projectName,
            description,
            endDate,
            owner: req.user.id
        });

        const savedProject = await newProject.save();

        res.status(201).json(savedProject);

    } catch (err) {
        res.status(400).json({
            error: 'Failed to create project'
        });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ error: 'Project not found' });
        }

        await logActivity({
            actionType: 'project_updated',
            projectId: updatedProject._id,
            userId: req.user?.id,
            description: `Projet "${updatedProject.projectName}" a été modifié`,
            metadata: { changes: req.body }
        });

        res.status(200).json(updatedProject);
    } catch (err) {
        res.status(400).json({ error: 'Update failed' });
    }
};

// FIX 2: التحقق من ملكية المشروع قبل الحذف
exports.removeProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // فقط المالك يمكنه حذف المشروع
        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Only the project owner can delete this project' });
        }

        await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
};