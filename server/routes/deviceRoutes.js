const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Import device controller functions
const {
  getDeviceConnections,
  getDeviceConnection,
  createDeviceConnection,
  updateDeviceConnection,
  deleteDeviceConnection,
  getFitbitAuthUrl,
  handleFitbitCallback
} = require('../controllers/deviceController');

// Device connection routes
router.route('/')
  .get(protect, getDeviceConnections)
  .post(protect, createDeviceConnection);

router.route('/:id')
  .get(protect, getDeviceConnection)
  .put(protect, updateDeviceConnection)
  .delete(protect, deleteDeviceConnection);

// Fitbit OAuth routes
router.get('/fitbit/auth', protect, getFitbitAuthUrl);
router.get('/fitbit/callback', handleFitbitCallback);

module.exports = router;