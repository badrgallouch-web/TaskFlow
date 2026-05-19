const express = require('express');
const router = express.Router({ mergeParams: true });
const activityController = require('../controllers/activityController');
// FIX: إضافة protect — سجل الأنشطة يجب أن يكون محمياً
const protect = require('../middlewares/authMiddleware');

// GET /api/projects/:id/activities
router.get('/', protect, activityController.getProjectActivities);

module.exports = router;