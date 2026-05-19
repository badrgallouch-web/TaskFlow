const express = require('express');
const router = express.Router({ mergeParams: true });
const protect = require('../middlewares/authMiddleware');
const activityController = require('../controllers/activityController');

router.get('/', protect, activityController.getProjectActivities);

module.exports = router;
