const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const warehouseTimeSlotController = require('../controllers/warehouseTimeSlotController');

const router = express.Router();

// Middleware for UUID validation
const validateUuidParam = (param) => (req, res, next) => {
  const { validateUuid } = require('../utils/uuidValidator');
  if (!validateUuid(req.params[param])) {
    return res.status(400).json({ success: false, message: `Invalid ${param} format` });
  }
  next();
};

// get all warehouse time slots
router.get('/getall', authenticateToken, warehouseTimeSlotController.getAllWarehouseTimeSlots);

// get all warehouse time slots by warehouse id (explicit)
router.get('/:warehouseId', validateUuidParam('warehouseId'), warehouseTimeSlotController.getWarehouseTimeSlotsByWarehouseId);

// create a new warehouse time slot by warehouse ID req.body: { name, from, to }
router.post('/warehouse/:warehouseId', authenticateToken, validateUuidParam('warehouseId'), warehouseTimeSlotController.createWarehouseTimeSlotByWarehouseId);

// update a warehouse time slot req.body: { name, from, to, warehouseId }
router.put('/:id', authenticateToken, validateUuidParam('id'), warehouseTimeSlotController.updateWarehouseTimeSlot);

// delete a warehouse time slot
router.delete('/:id', authenticateToken, validateUuidParam('id'), warehouseTimeSlotController.deleteWarehouseTimeSlot);

module.exports = router;
