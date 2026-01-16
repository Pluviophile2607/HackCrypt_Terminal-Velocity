const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { verifyAttendance, getSessionAttendance } = require('../controllers/attendanceController');
const Attendance = require('../models/Attendance');
const Anomaly = require('../models/Anomaly');

// @desc    Mark attendance (Multi-Factor)
// @route   POST /api/attendance/verify
// @access  Private (Student Only)
router.post('/verify', protect, authorize('student'), verifyAttendance);

// @desc    Get session attendance (Faculty/Admin)
// @route   GET /api/attendance/session/:id
// @access  Private (Faculty/Admin Only)
router.get('/session/:id', protect, authorize('faculty', 'admin'), getSessionAttendance);

// @desc    Get all anomalies (Admin/Faculty)
// @route   GET /api/attendance/anomalies
// @access  Private (Faculty/Admin Only)
router.get('/anomalies', protect, authorize('faculty', 'admin'), async (req, res) => {
    try {
        const anomalies = await Anomaly.find()
            .populate('studentId', 'name email')
            .populate('sessionId', 'courseId')
            .sort({ createdAt: -1 });
        res.json(anomalies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching anomalies' });
    }
});

// @desc    Get my attendance history
// @route   GET /api/attendance/my
// @access  Private (Student Only)
router.get('/my', protect, authorize('student'), async (req, res) => {
    try {
        const history = await Attendance.find({ studentId: req.user._id })
            .populate('sessionId', 'courseId startTime')
            .sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history' });
    }
});

module.exports = router;
