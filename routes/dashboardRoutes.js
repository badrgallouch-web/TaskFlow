const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const protect = require('../middlewares/authMiddleware');

// GET /api/dashboard — الـ Frontend يطلب هذا المسار بالضبط
router.get('/', protect, dashboardController.getDashboardStats);

module.exports = router;