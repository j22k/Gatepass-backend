const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const visitortypeController = require('../controllers/visitortypeController');

const router = express.Router();

// get all visitor types
router.get('/getall', visitortypeController.getAllVisitorTypes);

// get visitor type by id
router.get('/:id', authenticateToken, visitortypeController.getVisitorTypeById);

// create a new visitor type req.body: { name }
router.post('/create', authenticateToken, visitortypeController.createVisitorType);

// update a visitor type req.body: { name }
router.put('/:id', authenticateToken, visitortypeController.updateVisitorType);

// disable a visitor type
router.put('/:id/disable', authenticateToken, visitortypeController.disableVisitorType);

// enable a visitor type
router.put('/:id/enable', authenticateToken, visitortypeController.enableVisitorType);

// get all disabled visitor types
router.get('/getall/disabled', authenticateToken, visitortypeController.getAllDisabledVisitorTypes);

module.exports = router;