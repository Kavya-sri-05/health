const express = require('express');
const router = express.Router();
const { 
  getMedications, 
  getMedication, 
  createMedication, 
  updateMedication, 
  deleteMedication 
} = require('../controllers/medicationController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

router.route('/')
  .get(getMedications)
  .post(createMedication);

router.route('/:id')
  .get(getMedication)
  .put(updateMedication)
  .delete(deleteMedication);

module.exports = router;