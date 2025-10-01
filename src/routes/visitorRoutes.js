const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
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

// get visitor request by userId
router.get('/user/:userId', authenticateToken, visitorController.getVisitorRequestsByUserId);

// get all pending visitor requests by userId
router.get('/user/:userId/pending', authenticateToken, visitorController.getPendingVisitorRequestsByUserId);

// get all approved visitor requests by userId
router.get('/user/:userId/approved', authenticateToken, visitorController.getApprovedVisitorRequestsByUserId);

// get all rejected visitor requests by userId
router.get('/user/:userId/rejected', authenticateToken, visitorController.getRejectedVisitorRequestsByUserId);

// approve a visitor request
router.put('/:id/approve', authenticateToken, visitorController.approveVisitorRequest);

// reject a visitor request
router.put('/:id/reject', authenticateToken, visitorController.rejectVisitorRequest);

// Get visitor request by tracking code (public)
router.get('/track/:trackingCode', visitorController.getVisitorRequestByTrackingCode);

// Get all visitor requests by logged-in receptionist's warehouse
router.get('/receptionist/all', authenticateToken, visitorController.getAllVisitorRequestsByReceptionistWarehouse);

// Get today's visitor requests by logged-in receptionist's warehouse
router.get('/receptionist/today', authenticateToken, visitorController.getTodayVisitorRequestsByReceptionistWarehouse);

// Update visitor status by receptionist
router.put('/receptionist/update/:id', authenticateToken, visitorController.updateVisitorStatusByReceptionist);

module.exports = router;