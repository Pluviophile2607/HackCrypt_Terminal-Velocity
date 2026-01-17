const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        role: {
            type: String,
            enum: ['student', 'faculty', 'admin'],
            default: 'student',
        },
        department: {
            type: String,
            default: 'Computer Science'
        },
        facultyCode: {
            type: String,
            unique: true,
            sparse: true // Only for faculty
        },
        biometricProfile: {
            faceVector: [Number],        // Simulated 128-d embedding
        },
        consentAccepted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
