const express = require('express');
const router = express.Router({ mergeParams: true }); // pour accéder à :id du projet parent
const activityController = require('../controllers/activityController');

// GET /api/projects/:id/activities
router.get('/', activityController.getProjectActivities);

module.exports = router;