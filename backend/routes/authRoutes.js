const express = require('express');
const router = express.Router();
const { registerUser, loginUser, checkAdmin, addFaculty, getFaculties } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/check-admin', checkAdmin);

// Admin only routes
router.post('/add-faculty', protect, authorize('admin'), addFaculty);
router.get('/faculties', protect, authorize('admin'), getFaculties);

module.exports = router;
