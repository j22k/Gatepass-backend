const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// get all users
router.get('/getall', authenticateToken, authorizeRoles('Admin'), userController.getAllUsers);

// get users by warehouse id
router.get('/warehouse/:warehouseId', authenticateToken, authorizeRoles('Admin'), userController.getUsersByWarehouseId);

// get total active users
router.get('/total-active', authenticateToken, authorizeRoles('Admin'), userController.getTotalActiveUsers);

// get user by id
router.get('/:id', authenticateToken, authorizeRoles('Admin'), userController.getUserById);

// create a new user req.body: { name, email, phone, password, designation, role, warehouseId }
router.post('/create', authenticateToken, authorizeRoles('Admin'), userController.createUser);

// update a user req.body: { name, email, phone, password, designation, role, warehouseId, isActive }
router.put('/:id', authenticateToken, authorizeRoles('Admin'), userController.updateUser);

// disable a user
router.put('/:id/disable', authenticateToken, authorizeRoles('Admin'), userController.disableUser);

// enable a user
router.put('/:id/enable', authenticateToken, authorizeRoles('Admin'), userController.enableUser);

module.exports = router;