const express = require('express');
const router = express.Router();
const { 
  getHealthMetrics, 
  getHealthMetric, 
  createHealthMetric, 
  updateHealthMetric, 
  deleteHealthMetric,
  getHealthMetricsByRange
} = require('../controllers/healthMetricController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get metrics by date range
router.get('/range', getHealthMetricsByRange);

// Main routes
router.route('/')
  .get(getHealthMetrics)
  .post(createHealthMetric);

router.route('/:id')
  .get(getHealthMetric)
  .put(updateHealthMetric)
  .delete(deleteHealthMetric);

module.exports = router;