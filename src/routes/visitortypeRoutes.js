const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const visitortypeController = require('../controllers/visitortypeController');

const router = express.Router();

// get all visitor types
router.get('/getall', visitortypeController.getAllVisitorTypes);

// get visitor type by id
router.get('/:id', authenticateToken, authorizeRoles('Admin'), visitortypeController.getVisitorTypeById);

// create a new visitor type req.body: { name }
router.post('/create', authenticateToken, authorizeRoles('Admin'), visitortypeController.createVisitorType);

// update a visitor type req.body: { name }
router.put('/:id', authenticateToken, authorizeRoles('Admin'), visitortypeController.updateVisitorType);

// disable a visitor type
router.put('/:id/disable', authenticateToken, authorizeRoles('Admin'), visitortypeController.disableVisitorType);

// enable a visitor type
router.put('/:id/enable', authenticateToken, authorizeRoles('Admin'), visitortypeController.enableVisitorType);

// get all disabled visitor types
router.get('/getall/disabled', authenticateToken, authorizeRoles('Admin'), visitortypeController.getAllDisabledVisitorTypes);

module.exports = router;