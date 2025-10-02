const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const roleController = require('../controllers/roleController');

const router = express.Router();

// get all roles
router.get('/getall', authenticateToken, authorizeRoles('Admin'), roleController.getAllRoles);


module.exports = router;