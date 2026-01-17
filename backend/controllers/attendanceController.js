const Attendance = require('../models/Attendance');
const ClassSession = require('../models/ClassSession');
const User = require('../models/User');
const Anomaly = require('../models/Anomaly');
const { compareFaceVectors } = require('../utils/biometrics');

// @desc    Verify and mark attendance
// @route   POST /api/attendance/verify
// @access  Student
const verifyAttendance = async (req, res) => {
    try {
        const { sessionId, faceVector, qrToken, livenessBlinks, deviceHash, ipHash } = req.body;
        const studentId = req.user._id;

        // 1. Validate Session
        const session = await ClassSession.findById(sessionId);
        if (!session || !session.active) {
            return res.status(400).json({ message: 'Session is closed or not found' });
        }

        // 2. Proxy Prevention: Check for existing attendance
        const existing = await Attendance.findOne({ studentId, sessionId });
        if (existing && existing.status === 'MARKED') {
            return res.status(400).json({ message: 'Attendance already marked for this session' });
        }

        const user = await User.findById(studentId);
        let results = {
            face: { success: true, confidence: 100 },
            idCard: true,
            liveness: true
        };
        let anomalies = [];
        let attempts = existing ? existing.attempts + 1 : 1;

        // 3. Simplified Verification Pipeline

        // A. Facial Recognition
        if (session.verificationRules.face) {
            // Auto-sync profile if it doesn't exist (First time setup)
            if (!user.biometricProfile?.faceVector && faceVector) {
                user.biometricProfile = { ...user.biometricProfile, faceVector };
                await user.save();
            }

            const confidence = compareFaceVectors(user.biometricProfile.faceVector, faceVector);
            // Lowered threshold to 60 for better real-world reliability
            results.face = { success: confidence > 60, confidence };
            if (!results.face.success) anomalies.push('Face mismatch');
        }

        // B. Session Token (QR Token)
        if (session.verificationRules.idCard) {
            // Case-insensitive and trimmed comparison
            const match = session.qrToken?.trim().toUpperCase() === qrToken?.trim().toUpperCase();
            results.idCard = match;
            if (!match) anomalies.push('Invalid Session Token');
        }

        // C. Liveness (Blink Detection)
        if (session.verificationRules.liveness) {
            results.liveness = livenessBlinks >= 2; // Require 2 blinks for security
            if (!results.liveness) anomalies.push('Liveness (blinks) failed');
        }

        // 4. Decision Engine
        const isSuccess = Object.values(results).every(v => v === true || (v && v.success === true));
        const status = isSuccess ? 'MARKED' : (anomalies.length > 0 ? 'FAILED' : 'FAILED');

        // 5. Audit & Anomaly Reporting
        if (status === 'FAILED') {
            await Anomaly.create({
                studentId,
                sessionId,
                reason: anomalies.join(', '),
                severity: attempts > 2 ? 'MEDIUM' : 'LOW',
                details: { results, deviceHash, ipHash, attempts }
            });
        }

        // 6. Persistence
        const updateData = {
            studentId,
            sessionId,
            results,
            capturedData: {
                faceVector,
                qrToken,
                livenessBlinks
            },
            status,
            attempts,
            deviceHash,
            ipHash
        };

        let attendanceRecord;
        if (existing) {
            Object.assign(existing, updateData);
            attendanceRecord = await existing.save();
        } else {
            attendanceRecord = await Attendance.create(updateData);
        }

        res.json({
            success: isSuccess,
            status,
            results,
            message: isSuccess ? 'Attendance marked successfully' : 'Verification failed',
            anomalies
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing verification' });
    }
};

// @desc    Get attendance reports for faculty
// @route   GET /api/attendance/session/:id
// @access  Faculty
const getSessionAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ sessionId: req.params.id }).populate('studentId', 'name email');
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching session analytics' });
    }
};

module.exports = {
    verifyAttendance,
    getSessionAttendance
};
