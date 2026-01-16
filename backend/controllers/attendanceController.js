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
        const { sessionId, faceVector, fingerprint, qrToken, deviceHash, ipHash } = req.body;
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
            fingerprint: true,
            idCard: true,
            liveness: true
        };
        let anomalies = [];
        let attempts = existing ? existing.attempts + 1 : 1;

        // 3. Multi-Factor Pipeline

        // A. Facial Recognition
        if (session.verificationRules.face) {
            const confidence = compareFaceVectors(user.biometricProfile.faceVector, faceVector);
            results.face = { success: confidence > 85, confidence };
            if (!results.face.success) anomalies.push('Face mismatch');
        }

        // B. Fingerprint
        if (session.verificationRules.fingerprint) {
            const match = user.biometricProfile.fingerprintHash === fingerprint;
            results.fingerprint = match;
            if (!match) anomalies.push('Fingerprint mismatch');
        }

        // C. ID Card / QR
        if (session.verificationRules.idCard) {
            const match = session.qrToken === qrToken;
            results.idCard = match;
            if (!match) anomalies.push('Invalid QR Token');
        }

        // D. Liveness (Simulated Probability)
        if (session.verificationRules.liveness) {
            results.liveness = Math.random() > 0.05; // 95% liveness success rate
            if (!results.liveness) anomalies.push('Liveness verification failed');
        }

        // 4. Decision Engine
        const isSuccess = Object.values(results).every(v => v === true || (v && v.success === true));
        const status = isSuccess ? 'MARKED' : (anomalies.length > 1 ? 'FLAGGED' : 'FAILED');

        // 5. Proxy Prevention Logic
        if (attempts > 3 && status !== 'MARKED') {
            await Anomaly.create({
                studentId,
                sessionId,
                reason: 'Too many failed verification attempts',
                severity: 'HIGH',
                details: { attempts, anomalies }
            });
        }

        if (status === 'FLAGGED' || status === 'FAILED') {
            await Anomaly.create({
                studentId,
                sessionId,
                reason: anomalies.join(', '),
                severity: status === 'FLAGGED' ? 'MEDIUM' : 'LOW',
                details: { results, deviceHash, ipHash }
            });
        }

        // 6. Upsert Attendance
        let attendanceRecord;
        if (existing) {
            existing.results = results;
            existing.status = status;
            existing.attempts = attempts;
            existing.deviceHash = deviceHash;
            existing.ipHash = ipHash;
            attendanceRecord = await existing.save();
        } else {
            attendanceRecord = await Attendance.create({
                studentId,
                sessionId,
                results,
                status,
                attempts,
                deviceHash,
                ipHash
            });
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
