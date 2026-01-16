const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateFaceVector, generateFingerprintHash } = require('../utils/biometrics');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, consentAccepted } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        if (userExists.role === role) {
            return res.status(400).json({ message: 'You are already registered. Please go to login.' });
        } else {
            return res.status(400).json({ message: `This email is already registered as ${userExists.role}` });
        }
    }

    // Check for existing administrator
    if (role === 'admin') {
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(400).json({ message: 'Administrator account already exists. Only one admin is allowed.' });
        }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare biometric profile for students
    let biometricProfile = {};
    if (role === 'student') {
        biometricProfile = {
            faceVector: generateFaceVector(),
            fingerprintHash: generateFingerprintHash(email)
        };
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        biometricProfile,
        consentAccepted: !!consentAccepted
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
            message: 'Login successful'
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

// @desc    Check if admin exists
// @route   GET /api/auth/check-admin
// @access  Public
const checkAdmin = async (req, res) => {
    const adminExists = await User.findOne({ role: 'admin' });
    res.json({ exists: !!adminExists });
};

module.exports = {
    registerUser,
    loginUser,
    checkAdmin,
};
