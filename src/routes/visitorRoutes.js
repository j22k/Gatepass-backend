const express = require('express');
const { check } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const visitorController = require('../controllers/visitorController');

const validateRequest = require('../utils/validator');

const router = express.Router();

// Middleware for authentication and authorization
const adminAuth = [authenticateToken, authorizeRoles('Admin')];
const receptionistAuth = [authenticateToken, authorizeRoles('Admin', 'Receptionist')];
const approverAuth = [authenticateToken, authorizeRoles('Approver')];

// Get all visitor requests
router.get('/getall', adminAuth, visitorController.getAllVisitorRequests);

// Get visitor request by ID
router.get('/:id', [
	check('id').isUUID().withMessage('Invalid ID format')
], validateRequest, visitorController.getVisitorRequestById);

// Create a new visitor request
router.post('/create', [
	check('name').notEmpty().withMessage('Name is required').trim().escape(),
	check('phone').notEmpty().withMessage('Phone is required').trim().escape(),
	check('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	check('visitorTypeId').isUUID().withMessage('Invalid visitorTypeId'),
	check('warehouseId').isUUID().withMessage('Invalid warehouseId'),
	check('warehouseTimeSlotId').isUUID().withMessage('Invalid warehouseTimeSlotId'),
	check('accompanying').optional().isArray(),
	check('date').isISO8601().toDate().withMessage('Invalid date format')
], validateRequest, visitorController.createVisitorRequest);

// Update a visitor request
router.put('/:id', [
	check('id').isUUID().withMessage('Invalid visitor request ID'),
	check('name').optional().trim().escape(),
	check('phone').optional().trim().escape(),
	check('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
	check('visitorTypeId').optional().isUUID().withMessage('Invalid visitorTypeId'),
	check('warehouseId').optional().isUUID().withMessage('Invalid warehouseId'),
	check('warehouseTimeSlotId').optional().isUUID().withMessage('Invalid warehouseTimeSlotId'),
	check('accompanying').optional().isArray(),
	check('date').optional().isISO8601().toDate().withMessage('Invalid date format'),
	check('status').optional().isIn(['pending','approved','rejected']).withMessage('Invalid status')
], validateRequest, receptionistAuth, visitorController.updateVisitorRequest);

// Approve a visitor request
router.put('/:id/approve', [
	check('id').isUUID().withMessage('Invalid visitor request ID')
], validateRequest, approverAuth, visitorController.approveVisitorRequest);

// Reject a visitor request
router.put('/:id/reject', [
	check('id').isUUID().withMessage('Invalid visitor request ID'),
	check('reason').optional().trim().escape()
], validateRequest, approverAuth, visitorController.rejectVisitorRequest);

// Get visitor request by tracking code (public)
router.get('/track/:trackingCode', visitorController.getVisitorRequestByTrackingCode);

// Get all visitor requests by logged-in receptionist's warehouse
router.get('/receptionist/all', receptionistAuth, visitorController.getAllVisitorRequestsByReceptionistWarehouse);

// Get today's visitor requests by logged-in receptionist's warehouse
router.get('/receptionist/today', receptionistAuth, visitorController.getTodayVisitorRequestsByReceptionistWarehouse);

// Update visitor status by receptionist
router.put('/receptionist/update/:id', receptionistAuth, visitorController.updateVisitorStatusByReceptionist);

// Get total pending visitor requests
router.get('/stats/pending', adminAuth, visitorController.getTotalPendingRequests);

// Get total approved visitor requests for today
router.get('/stats/approved-today', adminAuth, visitorController.getTotalApprovedToday);

module.exports = router;