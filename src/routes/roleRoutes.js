const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const roleController = require('../controllers/roleController');

const router = express.Router();

// get all roles
router.get('/getall', authenticateToken, roleController.getAllRoles);


module.exports = router;