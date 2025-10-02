const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// get all users
router.get('/getall', authenticateToken, userController.getAllUsers);

// get users by warehouse id
router.get('/warehouse/:warehouseId', authenticateToken, userController.getUsersByWarehouseId);

// get total active users
router.get('/total-active', authenticateToken, userController.getTotalActiveUsers);

// get user by id
router.get('/:id', authenticateToken, userController.getUserById);

// create a new user req.body: { name, email, phone, password, designation, role, warehouseId }
router.post('/create', authenticateToken, userController.createUser);

// update a user req.body: { name, email, phone, password, designation, role, warehouseId, isActive }
router.put('/:id', authenticateToken, userController.updateUser);

// disable a user
router.put('/:id/disable', authenticateToken, userController.disableUser);

// enable a user
router.put('/:id/enable', authenticateToken, userController.enableUser);

module.exports = router;