const express = require('express');
const router = express.Router();
const { registerUser, loginUser, checkAdmin } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/check-admin', checkAdmin);

module.exports = router;
