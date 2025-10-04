const express = require('express');
const { check } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const warehouseTimeSlotController = require('../controllers/warehouseTimeSlotController');
const validateRequest = require('../utils/validator');

const router = express.Router();

// Middleware for UUID validation
const validateUuidParam = (param) => (req, res, next) => {
	const { validateUuid } = require('../utils/uuidValidator');
	if (!validateUuid(req.params[param])) {
		return res.status(400).json({ success: false, message: `Invalid ${param} format` });
	}
	next();
};

// get all warehouse time slots
router.get('/getall', authenticateToken, authorizeRoles('Admin'), warehouseTimeSlotController.getAllWarehouseTimeSlots);

// get all warehouse time slots by warehouse id (explicit)
router.get('/:warehouseId', [
	check('warehouseId').isUUID().withMessage('Invalid warehouseId format')
], validateRequest, warehouseTimeSlotController.getWarehouseTimeSlotsByWarehouseId);

// create a new warehouse time slot by warehouse ID req.body: { name, from, to }
router.post('/warehouse/:warehouseId', [
	check('warehouseId').isUUID().withMessage('Invalid warehouseId format'),
	check('name').notEmpty().withMessage('Name is required').trim().escape(),
	check('from').notEmpty().withMessage('Start time is required').trim().escape(),
	check('to').notEmpty().withMessage('End time is required').trim().escape()
], validateRequest, authenticateToken, authorizeRoles('Admin'), warehouseTimeSlotController.createWarehouseTimeSlotByWarehouseId);

// update a warehouse time slot req.body: { name, from, to, warehouseId }
router.put('/:id', [
	check('id').isUUID().withMessage('Invalid time slot ID format'),
	check('name').optional().trim().escape(),
	check('from').optional().trim().escape(),
	check('to').optional().trim().escape(),
	check('warehouseId').optional().isUUID().withMessage('Invalid warehouseId format')
], validateRequest, authenticateToken, authorizeRoles('Admin'), warehouseTimeSlotController.updateWarehouseTimeSlot);

// delete a warehouse time slot
router.delete('/:id', [
	check('id').isUUID().withMessage('Invalid time slot ID format')
], validateRequest, authenticateToken, authorizeRoles('Admin'), warehouseTimeSlotController.deleteWarehouseTimeSlot);

module.exports = router;
