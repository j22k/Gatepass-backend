const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const warehouseworkflowController = require('../controllers/warehouseworkflowController');

const validateRequest = require('../utils/validator');

// Helper to wrap async route handlers for better error handling
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/warehouse-workflow/:warehouseId - Get structured workflow data by warehouse ID
router.get('/:warehouseId', [
	check('warehouseId').isUUID().withMessage('Invalid warehouse ID')
], validateRequest, authenticateToken, authorizeRoles('Admin', 'Receptionist'), asyncHandler(warehouseworkflowController.getWorkflowDatabyWarehouseId));

// POST /api/warehouse-workflow - Add a new workflow entry
router.post('/', [
	check('warehouse_id').isUUID().withMessage('Invalid warehouse ID'),
	check('visitor_type_id').isUUID().withMessage('Invalid visitor type ID'),
	check('step_no').isInt({ min: 1 }).withMessage('Step number must be a positive integer'),
	check('approver').isUUID().withMessage('Invalid approver ID')
], validateRequest, authenticateToken, authorizeRoles('Admin'), asyncHandler(warehouseworkflowController.addWorkflow));

// PUT /api/warehouse-workflow/:id - Update a workflow entry
router.put('/:id', [
	check('id').isUUID().withMessage('Invalid workflow ID'),
	check('step_no').optional().isInt({ min: 1 }).withMessage('Step number must be a positive integer'),
	check('approver').optional().isUUID().withMessage('Invalid approver ID')
], validateRequest, authenticateToken, authorizeRoles('Admin'), asyncHandler(warehouseworkflowController.updateWorkflow));

// DELETE /api/warehouse-workflow/:id - Delete a workflow entry
router.delete('/:id', [
	check('id').isUUID().withMessage('Invalid workflow ID')
], validateRequest, authenticateToken, authorizeRoles('Admin'), asyncHandler(warehouseworkflowController.deleteWorkflow));

module.exports = router;