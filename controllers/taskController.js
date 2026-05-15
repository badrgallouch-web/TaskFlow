const Task = require('../models/Task');

exports.getAllTasks = async (req, res) => {
    try {
        const { statut, priorite, assignedTo, search, page = 1, limit = 10 } = req.query;
        
        const filter = {};
        
        // filtrage conditionnel
        if (statut) filter.status = statut;
        if (priorite) filter.priority = priorite;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Task.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);
        const data = await Task.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.status(200).json({ data, total, page: Number(page), totalPages });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ msg: "Task not found" });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { title, priority, status, projectId } = req.body;

        const newTask = await Task.create({
            title,
            priority,
            status,
            projectId
        });

        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ msg: "Task not found" });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {
            return res.status(404).json({ msg: "Task not found" });
        }

        res.status(200).json({ msg: "Task deleted" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ msg: "Task not found" });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

exports.getTasksByProject = async (req, res) => {
    try {
        const tasks = await Task.find({ projectId: req.params.id });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};