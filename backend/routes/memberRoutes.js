const express = require('express');
const router = express.Router();

const protect = require('../middlewares/authMiddleware');
const memberController = require('../controllers/memberController');

router.post('/:id/members', protect, memberController.inviteMember);
router.delete('/:id/members/:userId', protect, memberController.removeMember);

module.exports = router;