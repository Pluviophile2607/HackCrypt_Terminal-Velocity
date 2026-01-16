const mongoose = require('mongoose');

const anomalySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ClassSession'
    },
    reason: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'LOW'
    },
    details: {
        type: Object
    }
}, { timestamps: true });

module.exports = mongoose.model('Anomaly', anomalySchema);
