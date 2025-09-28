const express = require('express');
const { authenticateToken , authorizeRoles} = require('../middlewares/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// get all users
router.get('/getall', authenticateToken, userController.getAllUsers);

// get user by id
router.get('/:id', authenticateToken, userController.getUserById);

// create a new user req.body: { name, email, phone, password, designation, role, warehouseId }
router.post('/create', authenticateToken, authorizeRoles('Admin'),userController.createUser);

// update a user req.body: { name, email, phone, password, designation, role, warehouseId, isActive }
router.put('/:id', authenticateToken,authorizeRoles('Admin'), userController.updateUser);

// delete a user
router.delete('/:id', authenticateToken,authorizeRoles('Admin'), userController.deleteUser);

module.exports = router;