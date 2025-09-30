const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const warehouseController = require('../controllers/warehouseController');

const router = express.Router();

// get all warehouses
router.get('/getall', warehouseController.getAllWarehouses);

// get warehouse by id
router.get('/:id', authenticateToken, warehouseController.getWarehouseById);

// create a new warehouse req.body: { name, location }
router.post('/create', authenticateToken, warehouseController.createWarehouse);

// update a warehouse req.body: { name, location }
router.put('/:id', authenticateToken, warehouseController.updateWarehouse);

// disable a warehouse
router.put('/:id/disable', authenticateToken, warehouseController.disableWarehouse);

// enable a warehouse
router.put('/:id/enable', authenticateToken, warehouseController.enableWarehouse);

// get all disabled warehouses
router.get('/getall/disabled', authenticateToken, warehouseController.getAllDisabledWarehouses);

module.exports = router;