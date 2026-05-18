const express = require('express');

const router = express.Router();

const Task = require('../models/Task');


// Assign task to member
router.patch('/:id/assign', async (req, res) => {

  try {

    const { userId } = req.body;

    const task = await Task.findByIdAndUpdate(

      req.params.id,

      { assignedTo: userId },

      { new: true }

    )
      .populate('assignedTo', 'fullName email');

    if (!task) {

      return res.status(404).json({
        message: 'Task not found'
      });

    }

    res.json(task);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

});


// Get tasks assigned to user
router.get('/my-tasks/:userId', async (req, res) => {

  try {

    const filter = {
      assignedTo: req.params.userId
    };

    if (req.query.projectId) {

      filter.projectId = req.query.projectId;

    }

    const tasks = await Task.find(filter)

      .populate('assignedTo', 'fullName email')

      .populate('projectId', 'projectName');

    res.json(tasks);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

});

module.exports = router;