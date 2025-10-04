const express = require('express');
const { check } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const warehouseController = require('../controllers/warehouseController');

const validateRequest = require('../utils/validator');

const router = express.Router();

// get all warehouses
router.get('/getall', warehouseController.getAllWarehouses);

// get all disabled warehouses (Admin only)
router.get('/getall/disabled', authenticateToken, authorizeRoles('Admin'), warehouseController.getAllDisabledWarehouses);

// get warehouse by ID
router.get('/:id', [
	check('id').isUUID().withMessage('Invalid warehouse ID')
], validateRequest, authenticateToken, authorizeRoles('Admin'), warehouseController.getWarehouseById);

// create a new warehouse (Admin only)
router.post('/create', [
	check('name').notEmpty().withMessage('Name is required').trim().escape(),
	check('location').notEmpty().withMessage('Location is required').trim().escape()
], validateRequest, authenticateToken, authorizeRoles('Admin'), warehouseController.createWarehouse);

// update a warehouse (Admin only)
router.put('/:id', [
	check('id').isUUID().withMessage('Invalid warehouse ID'),
	check('name').optional().trim().escape(),
	check('location').optional().trim().escape()
], validateRequest, authenticateToken, authorizeRoles('Admin'), warehouseController.updateWarehouse);

// disable a warehouse (Admin only)
router.put('/:id/disable', [
	check('id').isUUID().withMessage('Invalid warehouse ID')
], validateRequest, authenticateToken, authorizeRoles('Admin'), warehouseController.disableWarehouse);

// enable a warehouse (Admin only)
router.put('/:id/enable', [
	check('id').isUUID().withMessage('Invalid warehouse ID')
], validateRequest, authenticateToken, authorizeRoles('Admin'), warehouseController.enableWarehouse);

module.exports = router;