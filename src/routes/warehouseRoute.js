const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const warehouseController = require('../controllers/warehouseController');


const router = express.Router();

// get all warehouses
router.get('/getall', warehouseController.getAllWarehouses);

// get all disabled warehouses
router.get('/getall/disabled', authenticateToken, authorizeRoles('Admin'), warehouseController.getAllDisabledWarehouses);


// get warehouse by id
router.get('/:id', authenticateToken, authorizeRoles('Admin'), warehouseController.getWarehouseById);

// create a new warehouse req.body: { name, location }
router.post('/create', authenticateToken, authorizeRoles('Admin'), warehouseController.createWarehouse);

// update a warehouse req.body: { name, location }
router.put('/:id', authenticateToken, authorizeRoles('Admin'), warehouseController.updateWarehouse);

// disable a warehouse
router.put('/:id/disable', authenticateToken, authorizeRoles('Admin'), warehouseController.disableWarehouse);

// enable a warehouse
router.put('/:id/enable', authenticateToken, authorizeRoles('Admin'), warehouseController.enableWarehouse);

module.exports = router;