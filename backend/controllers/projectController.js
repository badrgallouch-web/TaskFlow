const Project = require('../models/Project');
const { logActivity } = require('../services/activityLogger');

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
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
            userId: req.user.id,
            description: `Projet "${updatedProject.projectName}" a été modifié`,
            metadata: {
                projectName: updatedProject.projectName,
                changes: req.body,
            },
        });

        res.status(200).json(updatedProject);
    } catch (err) {
        res.status(400).json({ error: 'Update failed' });
    }
};

exports.removeProject = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('members', 'fullName email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};