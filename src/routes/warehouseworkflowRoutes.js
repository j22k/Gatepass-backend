const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const warehouseworkflowController = require('../controllers/warehouseworkflowController');

// GET /api/warehouse-workflow/:warehouseId - Get structured workflow data by warehouse ID
router.get('/:warehouseId', authenticateToken, warehouseworkflowController.getWorkflowDatabyWarehouseId);

// POST /api/warehouse-workflow - Add a new workflow entry
router.post('/', authenticateToken, warehouseworkflowController.addWorkflow);

// PUT /api/warehouse-workflow/:id - Update a workflow entry
router.put('/:id', authenticateToken, warehouseworkflowController.updateWorkflow);

// DELETE /api/warehouse-workflow/:id - Delete a workflow entry
router.delete('/:id', authenticateToken, warehouseworkflowController.deleteWorkflow);


module.exports = router;