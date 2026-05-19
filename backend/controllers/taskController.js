const Task = require('../models/Task');
const { logActivity } = require('../services/activityLogger');
const { createNotification } = require('../services/notificationLogger');
const { statusLabel } = require('../utils/activityMessages');

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, priority, status, projectId } = req.body;

    const newTask = await Task.create({ title, priority, status, projectId });

    await logActivity({
      actionType: 'task_created',
      projectId,
      userId: req.user.id,
      description: `Tâche "${title}" créée`,
      metadata: { taskId: newTask._id, title, priority, status },
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

    if (!updatedTask) return res.status(404).json({ msg: 'Task not found' });

    if (req.body.status && req.body.status !== updatedTask.status) {
      await logActivity({
        actionType: 'task_status_changed',
        projectId: updatedTask.projectId,
        userId: req.user.id,
        description: `Statut de "${updatedTask.title}" modifié`,
        metadata: {
          taskId: updatedTask._id,
          title: updatedTask.title,
          newStatus: req.body.status,
        },
      });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) return res.status(404).json({ msg: 'Task not found' });

    await logActivity({
      actionType: 'task_deleted',
      projectId: deletedTask.projectId,
      userId: req.user.id,
      description: `Tâche "${deletedTask.title}" supprimée`,
      metadata: { taskId: deletedTask._id, title: deletedTask.title },
    });

    res.status(200).json({ msg: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    const oldStatus = task.status;

    if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        msg: 'You can only update tasks assigned to you',
      });
    }

    task.status = req.body.status;

    const updatedTask = await task.save();

    await logActivity({
      actionType: 'task_status_changed',
      projectId: updatedTask.projectId,
      userId: req.user.id,
      description: `Statut de "${updatedTask.title}" changé`,
      metadata: {
        taskId: updatedTask._id,
        title: updatedTask.title,
        oldStatus,
        newStatus: req.body.status,
      },
    });

    if (updatedTask.assignedTo && updatedTask.assignedTo.toString() !== req.user.id) {
      await createNotification({
        userId: updatedTask.assignedTo,
        type: 'task_status_changed',
        message: `Le statut de « ${updatedTask.title} » est passé à ${statusLabel(req.body.status)}`,
        projectId: updatedTask.projectId,
      });
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

exports.assignTask = async (req, res) => {
  try {
    const { userId } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId },
      { new: true }
    ).populate('assignedTo', 'fullName email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await logActivity({
      actionType: 'task_assigned',
      projectId: task.projectId,
      userId: req.user.id,
      description: `Tâche "${task.title}" assignée`,
      metadata: {
        taskId: task._id,
        title: task.title,
        assignedTo: userId,
        assigneeName: task.assignedTo?.fullName,
      },
    });

    if (userId && userId !== req.user.id) {
      await createNotification({
        userId,
        type: 'task_assigned',
        message: `La tâche « ${task.title} » vous a été assignée`,
        projectId: task.projectId,
      });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const filter = { assignedTo: req.params.userId };

    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'fullName email')
      .populate('projectId', 'projectName');

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
