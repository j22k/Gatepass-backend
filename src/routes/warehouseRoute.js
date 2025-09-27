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

// delete a warehouse
router.delete('/:id', authenticateToken, warehouseController.deleteWarehouse);

module.exports = router;