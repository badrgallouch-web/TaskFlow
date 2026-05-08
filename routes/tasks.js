const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');

// F4 — Assigner une tâche à un membre
router.patch('/:id/assign', async (req, res) => {
  try {
    const { userId } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId },
      { new: true }
    ).populate('assignedTo', 'nom email');
    
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });
    
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// F4 — Voir les tâches assignées au membre connecté
router.get('/my-tasks/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.userId })
      .populate('assignedTo', 'nom email')
      .populate('projet', 'titre');
    
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;