const express = require('express');
const { check } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const userController = require('../controllers/userController');
const validateRequest = require('../utils/validator');

const router = express.Router();

// Middleware for authentication and authorization
const adminAuth = [authenticateToken, authorizeRoles('Admin')];

// get all users
router.get('/getall', adminAuth, userController.getAllUsers);

// get users by warehouse id
router.get('/warehouse/:warehouseId', adminAuth, userController.getUsersByWarehouseId);

// get total active users
router.get('/total-active', adminAuth, userController.getTotalActiveUsers);

// get user by id
router.get('/:id', adminAuth, userController.getUserById);

// create a new user req.body: { name, email, phone, password, designation, role, warehouseId }
router.post('/create', [
	check('name').notEmpty().withMessage('Name is required').trim().escape(),
	check('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	check('phone').notEmpty().withMessage('Phone is required').trim().escape(),
	check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
	check('designation').notEmpty().withMessage('Designation is required').trim().escape(),
	check('role').notEmpty().withMessage('Role is required').trim().escape(),
	check('warehouseId').isUUID().withMessage('Invalid warehouseId')
], validateRequest, adminAuth, userController.createUser);

// update a user req.body: { name, email, phone, password, designation, role, warehouseId, isActive }
router.put('/:id', [
	check('id').isUUID().withMessage('Invalid user ID'),
	check('name').optional().trim().escape(),
	check('email').optional().isEmail().withMessage('Invalid email').normalizeEmail(),
	check('phone').optional().trim().escape(),
	check('password').optional().isLength({ min: 6 }),
	check('designation').optional().trim().escape(),
	check('role').optional().trim().escape(),
	check('warehouseId').optional().isUUID().withMessage('Invalid warehouseId'),
	check('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], validateRequest, adminAuth, userController.updateUser);

// disable a user
router.put('/:id/disable', [
	check('id').isUUID().withMessage('Invalid user ID')
], validateRequest, adminAuth, userController.disableUser);

// enable a user
router.put('/:id/enable', [
	check('id').isUUID().withMessage('Invalid user ID')
], validateRequest, adminAuth, userController.enableUser);

module.exports = router;