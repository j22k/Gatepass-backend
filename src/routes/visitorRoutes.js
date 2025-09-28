const express = require('express');
const { authenticateToken , authorizeRoles} = require('../middlewares/auth');
const visitorController = require('../controllers/visitorController');
const warehouseController = require('../controllers/warehouseController');
const warehouseTimeSlotController = require('../controllers/warehouseTimeSlotController');
const visitortypeController = require('../controllers/visitortypeController');

const router = express.Router();

// Get all visitor requests
router.get('/getall', authenticateToken, visitorController.getAllVisitorRequests);

// Get visitor request by ID
router.get('/:id', visitorController.getVisitorRequestById);

// Create a new visitor request
router.post('/create', visitorController.createVisitorRequest);

// Update a visitor request
router.put('/:id', authenticateToken, visitorController.updateVisitorRequest);

module.exports = router;