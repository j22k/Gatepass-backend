const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const warehouseTimeSlotController = require('../controllers/warehouseTimeSlotController');

const router = express.Router();

// get all warehouse time slots
router.get('/getall', authenticateToken, warehouseTimeSlotController.getAllWarehouseTimeSlots);

// get all warehouse time slots by warehouse id (explicit)
router.get('/:warehouseId', warehouseTimeSlotController.getWarehouseTimeSlotsByWarehouseId);


// backward compatibility: treat '/:id' as a warehouseId to match current frontend usage
router.get('/:id', authenticateToken, warehouseTimeSlotController.getWarehouseTimeSlotsByWarehouseId);

// create a new warehouse time slot req.body: { name, from, to, warehouseId }
router.post('/create', authenticateToken, warehouseTimeSlotController.createWarehouseTimeSlot);

// update a warehouse time slot req.body: { name, from, to, warehouseId }
router.put('/:id', authenticateToken, warehouseTimeSlotController.updateWarehouseTimeSlot);

// delete a warehouse time slot
router.delete('/:id', authenticateToken, warehouseTimeSlotController.deleteWarehouseTimeSlot);

module.exports = router;
