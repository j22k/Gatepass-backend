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

// delete a visitor type
router.delete('/:id', authenticateToken, visitortypeController.deleteVisitorType);

module.exports = router;