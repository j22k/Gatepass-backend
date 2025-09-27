const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.post('/login', authController.login);

// Token verification (protected)
router.get('/verify', authenticateToken, authController.verifyToken);


// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;