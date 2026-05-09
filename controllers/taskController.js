const Task = require('../models/Task');

exports.getTasksByProject = async (req, res) => {
    try {
        const tasks = await Task.find({ project: req.params.projectId });
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.addTask = async (req, res) => {
    try {
        const { title, description, status, project } = req.body;
        const newTask = new Task({ title, description, status, project });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(400).json({ error: "Failed to add task" });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedTask);
    } catch (err) {
        res.status(400).json({ error: "Failed to update task" });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Task deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete task" });
    }
};