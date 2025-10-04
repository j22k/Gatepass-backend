const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const validateRequest = require('../utils/validator');

const router = express.Router();

// Middleware groups for better performance
const validateLogin = [
	check('email')
		.isEmail().withMessage('A valid email is required')
		.normalizeEmail(),
	check('password')
		.notEmpty().withMessage('Password is required')
];

// Public routes with input validation & sanitization
router.post('/login', validateLogin, validateRequest, authController.login);

// Token verification (protected)
router.get('/verify', authenticateToken, authController.verifyToken);

// Protected routes
router.use(authenticateToken); // Apply token authentication middleware to all routes below
router.get('/profile', authController.getProfile);
router.post('/logout', authController.logout);

module.exports = router;