const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const roleController = require('../controllers/roleController');

const router = express.Router();

// Apply authentication and authorization middleware to all routes in this file
router.use(authenticateToken, authorizeRoles('Admin'));

// Get all roles
router.get('/getall', roleController.getAllRoles);

module.exports = router;