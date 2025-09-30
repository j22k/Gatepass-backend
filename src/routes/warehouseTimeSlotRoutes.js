const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const warehouseTimeSlotController = require('../controllers/warehouseTimeSlotController');

const router = express.Router();

// get all warehouse time slots
router.get('/getall', authenticateToken, warehouseTimeSlotController.getAllWarehouseTimeSlots);

// get all warehouse time slots by warehouse id (explicit)
router.get('/:warehouseId', warehouseTimeSlotController.getWarehouseTimeSlotsByWarehouseId);

// create a new warehouse time slot by warehouse ID req.body: { name, from, to }
router.post('/warehouse/:warehouseId', authenticateToken, warehouseTimeSlotController.createWarehouseTimeSlotByWarehouseId);

// update a warehouse time slot req.body: { name, from, to, warehouseId }
router.put('/:id', authenticateToken, warehouseTimeSlotController.updateWarehouseTimeSlot);

// delete a warehouse time slot
router.delete('/:id', authenticateToken, warehouseTimeSlotController.deleteWarehouseTimeSlot);

module.exports = router;
// delete a warehouse time slot
router.delete('/:id', authenticateToken, warehouseTimeSlotController.deleteWarehouseTimeSlot);

module.exports = router;
