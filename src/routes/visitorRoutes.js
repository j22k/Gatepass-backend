const express = require('express');
const { check } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const visitorController = require('../controllers/visitorController');

const validateRequest = require('../utils/validator');

const router = express.Router();

// Async handler for error safety
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Middleware for authentication and authorization
const adminAuth = [authenticateToken, authorizeRoles('Admin')];
const receptionistAuth = [authenticateToken, authorizeRoles('Admin', 'Receptionist')];
const approverAuth = [authenticateToken, authorizeRoles('Approver')];

// Get all visitor requests
router.get('/getall', adminAuth, asyncHandler(visitorController.getAllVisitorRequests));

// Get visitor request by ID
router.get('/:id', [
	check('id').isUUID().withMessage('Invalid ID format')
], validateRequest, asyncHandler(visitorController.getVisitorRequestById));

// --- Add missing user-based routes for Approver Dashboard ---
router.get('/user/:userId/pending', [
	check('userId').isUUID().withMessage('Invalid user ID format')
], validateRequest, asyncHandler(visitorController.getPendingVisitorRequestsByUserId));

router.get('/user/:userId/approved', [
	check('userId').isUUID().withMessage('Invalid user ID format')
], validateRequest, asyncHandler(visitorController.getApprovedVisitorRequestsByUserId));

router.get('/user/:userId/rejected', [
	check('userId').isUUID().withMessage('Invalid user ID format')
], validateRequest, asyncHandler(visitorController.getRejectedVisitorRequestsByUserId));

// Create a new visitor request
router.post('/create', [
	check('name').notEmpty().withMessage('Name is required').trim().escape(),
	check('phone').notEmpty().withMessage('Phone is required').trim().escape(),
	check('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	check('visitorTypeId').isUUID().withMessage('Invalid visitorTypeId'),
	check('warehouseId').isUUID().withMessage('Invalid warehouseId'),
	check('warehouseTimeSlotId').isUUID().withMessage('Invalid warehouseTimeSlotId'),
	check('accompanying').optional().isArray(),
	check('date').isISO8601().toDate().withMessage('Invalid date format'),
	check('declarationAcknowledged').isBoolean().withMessage('Declaration acknowledgment is required and must be true')
], validateRequest, asyncHandler(visitorController.createVisitorRequest));

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
	check('status').optional().isIn(['pending','approved','rejected']).withMessage('Invalid status'),
	check('declarationAcknowledged').optional().isBoolean().withMessage('Declaration acknowledgment must be a boolean')
], validateRequest, receptionistAuth, asyncHandler(visitorController.updateVisitorRequest));

// Approve a visitor request
router.put('/:id/approve', [
	check('id').isUUID().withMessage('Invalid visitor request ID')
], validateRequest, approverAuth, asyncHandler(visitorController.approveVisitorRequest));

// Reject a visitor request
router.put('/:id/reject', [
	check('id').isUUID().withMessage('Invalid visitor request ID'),
	check('reason').optional().trim().escape()
], validateRequest, approverAuth, asyncHandler(visitorController.rejectVisitorRequest));

// Get visitor request by tracking code (public)
router.get('/track/:trackingCode', asyncHandler(visitorController.getVisitorRequestByTrackingCode));

// Get all visitor requests by logged-in receptionist's warehouse
router.get('/receptionist/all', receptionistAuth, asyncHandler(visitorController.getAllVisitorRequestsByReceptionistWarehouse));

// Get today's visitor requests by logged-in receptionist's warehouse
router.get('/receptionist/today', receptionistAuth, asyncHandler(visitorController.getTodayVisitorRequestsByReceptionistWarehouse));

// Update visitor status by receptionist
router.put('/receptionist/update/:id', receptionistAuth, asyncHandler(visitorController.updateVisitorStatusByReceptionist));

// Get total pending visitor requests
router.get('/stats/pending', adminAuth, asyncHandler(visitorController.getTotalPendingRequests));

// Get total approved visitor requests for today
router.get('/stats/approved-today', adminAuth, asyncHandler(visitorController.getTotalApprovedToday));

module.exports = router;