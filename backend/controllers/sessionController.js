const ClassSession = require('../models/ClassSession');
const { v4: uuidv4 } = require('uuid');

// @desc    Start a session
// @route   POST /api/session/start
// @access  Faculty
const startSession = async (req, res) => {
    try {
        const { courseId, verificationRules } = req.body;

        const session = await ClassSession.create({
            courseId,
            facultyId: req.user._id,
            verificationRules,
            qrToken: Math.random().toString(36).substring(2, 8).toUpperCase(),
            active: true
        });

        const io = req.app.get('socketio');
        io.emit('sessionStarted', session);

        res.status(201).json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error starting session' });
    }
};

// @desc    End a session
// @route   PATCH /api/session/end/:id
// @access  Faculty
const endSession = async (req, res) => {
    try {
        const session = await ClassSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.facultyId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        session.active = false;
        session.endTime = Date.now();
        await session.save();

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Error ending session' });
    }
};

// @desc    Get active sessions
// @route   GET /api/session/active
// @access  Private
const getActiveSessions = async (req, res) => {
    try {
        const sessions = await ClassSession.find({ active: true }).populate('facultyId', 'name');
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sessions' });
    }
};

module.exports = {
    startSession,
    endSession,
    getActiveSessions
};
