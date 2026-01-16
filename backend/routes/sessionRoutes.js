const express = require('express');
const router = express.Router();
const { startSession, endSession, getActiveSessions } = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/start', protect, authorize('faculty'), startSession);
router.patch('/end/:id', protect, authorize('faculty'), endSession);
router.get('/active', protect, getActiveSessions);

module.exports = router;
