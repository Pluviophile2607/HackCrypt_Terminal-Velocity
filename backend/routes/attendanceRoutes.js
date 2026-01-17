const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { verifyAttendance, getSessionAttendance } = require('../controllers/attendanceController');
const Attendance = require('../models/Attendance');
const Anomaly = require('../models/Anomaly');
const User = require('../models/User');
const ClassSession = require('../models/ClassSession');

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

// @desc    Get dashboard stats
// @route   GET /api/attendance/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const totalUsers = await User.countDocuments();
            const activeSessionsCount = await ClassSession.countDocuments({ status: 'ACTIVE' });
            const totalAnomalies = await Anomaly.countDocuments();
            const highRiskAnomalies = await Anomaly.countDocuments({ severity: 'HIGH' });

            const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Bio-Medical'];
            const deptData = await Promise.all(departments.map(async (dept) => {
                const usersInDept = await User.find({ department: dept, role: 'student' }).select('_id');
                const userIds = usersInDept.map(u => u._id);

                const totalPossible = await Attendance.countDocuments({ studentId: { $in: userIds } });
                const attended = await Attendance.countDocuments({
                    studentId: { $in: userIds },
                    status: 'MARKED'
                });

                return {
                    name: dept,
                    value: totalPossible > 0 ? Math.round((attended / totalPossible) * 100) : 0
                };
            }));

            const students = await User.countDocuments({ role: 'student' });
            const facultyCount = await User.countDocuments({ role: 'faculty' });
            const admins = await User.countDocuments({ role: 'admin' });

            res.json({
                totalUsers,
                activeSessionsCount,
                totalAnomalies,
                highRiskAnomalies,
                distribution: [
                    { name: 'Students', value: students },
                    { name: 'Faculty', value: facultyCount },
                    { name: 'Admins', value: admins }
                ],
                deptData,
                systemHealth: 99.8
            });
        } else if (req.user.role === 'faculty') {
            // Filter anomalies by sessions created by this faculty
            const mySessions = await ClassSession.find({ facultyId: req.user._id });
            const sessionIds = mySessions.map(s => s._id);

            const totalEnrolled = await User.countDocuments({ role: 'student' });
            const myAnomalies = await Anomaly.countDocuments({ sessionId: { $in: sessionIds } });

            const totalAttendanceRecords = await Attendance.countDocuments({ sessionId: { $in: sessionIds } });
            const markedAttendance = await Attendance.countDocuments({
                sessionId: { $in: sessionIds },
                status: 'MARKED'
            });
            const avgAttendance = totalAttendanceRecords > 0 ? Math.round((markedAttendance / totalAttendanceRecords) * 100) : 0;

            res.json({
                totalEnrolled,
                avgAttendance,
                absentToday: 0, // Simplified for now
                alerts: myAnomalies
            });
        } else if (req.user.role === 'student') {
            const totalSessions = await Attendance.countDocuments({ studentId: req.user._id });
            const attendedSessions = await Attendance.countDocuments({
                studentId: req.user._id,
                status: 'MARKED'
            });
            const avgAttendance = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;

            res.json({
                avgAttendance,
                presentCount: attendedSessions
            });
        }
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// @desc    Get all students with their attendance accuracy
// @route   GET /api/attendance/students-summary
// @access  Faculty/Admin
router.get('/students-summary', protect, authorize('faculty', 'admin'), async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('name email');
        const summary = await Promise.all(students.map(async (student) => {
            const totalSessions = await Attendance.countDocuments({ studentId: student._id });
            const markedAttendance = await Attendance.countDocuments({
                studentId: student._id,
                status: 'MARKED'
            });
            const accuracy = totalSessions > 0 ? Math.round((markedAttendance / totalSessions) * 100) : 0;
            return {
                _id: student._id,
                name: student.name,
                email: student.email,
                accuracy
            };
        }));
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students summary' });
    }
});

// @desc    Get all students and faculty
// @route   GET /api/attendance/all-users
// @access  Admin
router.get('/all-users', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['student', 'faculty'] } }).select('name email role');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

module.exports = router;
