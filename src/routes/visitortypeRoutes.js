const express = require('express');
const { check } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const visitortypeController = require('../controllers/visitortypeController');
const validateRequest = require('../utils/validator');

const router = express.Router();

// Middleware for authentication and authorization
const adminAuth = [authenticateToken, authorizeRoles('Admin')];

// Get all visitor types
router.get('/getall', visitortypeController.getAllVisitorTypes);

// Get visitor type by ID
router.get('/:id', [
	check('id').isUUID().withMessage('Invalid ID format')
], validateRequest, adminAuth, visitortypeController.getVisitorTypeById);

// Create a new visitor type
router.post('/create', [
	check('name').notEmpty().withMessage('Name is required').trim().escape(),
	check('description').optional().trim().escape()
], validateRequest, adminAuth, visitortypeController.createVisitorType);

// Update a visitor type
router.put('/:id', [
	check('id').isUUID().withMessage('Invalid ID format'),
	check('name').optional().notEmpty().withMessage('Name must be a non-empty string').trim().escape(),
	check('description').optional().trim().escape(),
	check('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], validateRequest, adminAuth, visitortypeController.updateVisitorType);

// Disable a visitor type
router.put('/:id/disable', [
	check('id').isUUID().withMessage('Invalid ID format')
], validateRequest, adminAuth, visitortypeController.disableVisitorType);

// Enable a visitor type
router.put('/:id/enable', [
	check('id').isUUID().withMessage('Invalid ID format')
], validateRequest, adminAuth, visitortypeController.enableVisitorType);

// Get all disabled visitor types
router.get('/getall/disabled', adminAuth, visitortypeController.getAllDisabledVisitorTypes);

module.exports = router;