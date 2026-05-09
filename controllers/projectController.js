const Project = require('../models/Project');

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch projects from database" });
    }
};


exports.addProject = async (req, res) => {
    try {
        const { projectName, description, endDate } = req.body;
        const newProject = new Project({
            projectName,
            description,
            endDate
        });
        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (err) {
        res.status(400).json({ error: "Failed to create project" });
    }
};


exports.updateProject = async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedProject);
    } catch (err) {
        res.status(400).json({ error: "Update failed" });
    }
};


exports.removeProject = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
};