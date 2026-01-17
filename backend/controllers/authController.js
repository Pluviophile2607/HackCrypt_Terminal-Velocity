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
    const { name, email, password, role, facultyCode, consentAccepted } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // New Flow: Check Faculty Code
    if (role === 'faculty') {
        if (!facultyCode) {
            return res.status(400).json({ message: 'Faculty code is required' });
        }
        const validCode = await User.findOne({ email, facultyCode, role: 'faculty' });
        if (!validCode) {
            return res.status(400).json({ message: 'Invalid faculty code or email mismatch. Please contact Admin.' });
        }
        // If they exist with a password, they are already registered
        if (validCode.password && validCode.password !== 'PENDING') {
            return res.status(400).json({ message: 'Faculty account already activated. Please login.' });
        }

        // Update existing pending record
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        validCode.name = name;
        validCode.password = hashedPassword;
        validCode.consentAccepted = !!consentAccepted;
        await validCode.save();

        return res.status(201).json({
            _id: validCode.id,
            name: validCode.name,
            email: validCode.email,
            role: validCode.role,
            token: generateToken(validCode.id),
        });
    }

    // Check if user exists (for student/admin)
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Check for existing administrator
    if (role === 'admin') {
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(400).json({ message: 'Administrator account already exists.' });
        }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare biometric profile for students
    let biometricProfile = {};
    if (role === 'student') {
        biometricProfile = {
            faceVector: generateFaceVector()
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

// @desc    Add faculty (Admin only)
// @route   POST /api/auth/add-faculty
// @access  Private/Admin
const addFaculty = async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Please add name and email' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate a simple 6-digit faculty code
    const facultyCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const faculty = await User.create({
        name,
        email,
        password: 'PENDING', // Placeholder until they register
        role: 'faculty',
        facultyCode
    });

    if (faculty) {
        res.status(201).json({
            _id: faculty.id,
            name: faculty.name,
            email: faculty.email,
            facultyCode: faculty.facultyCode
        });
    } else {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Get all faculties (Admin only)
// @route   GET /api/auth/faculties
// @access  Private/Admin
const getFaculties = async (req, res) => {
    const faculties = await User.find({ role: 'faculty' }).select('name email facultyCode createdAt');
    res.json(faculties);
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
    addFaculty,
    getFaculties
};
