const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'ClassSession'
        },
        results: {
            face: { success: Boolean, confidence: Number },
            idCard: { type: Boolean, default: false },
            liveness: { type: Boolean, default: false }
        },
        capturedData: {
            faceVector: [Number],
            qrToken: String,
            livenessBlinks: Number
        },
        deviceHash: String,
        ipHash: String,
        status: {
            type: String,
            required: true,
            enum: ['MARKED', 'FAILED', 'FLAGGED'],
            default: 'FAILED',
        },
        attempts: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
