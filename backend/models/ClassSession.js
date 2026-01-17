const mongoose = require('mongoose');

const classSessionSchema = new mongoose.Schema({
    courseId: {
        type: String,
        required: true
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    verificationRules: {
        face: { type: Boolean, default: true },
        idCard: { type: Boolean, default: true },
        liveness: { type: Boolean, default: true }
    },
    qrToken: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ClassSession', classSessionSchema);
