const express = require('express');
const router = express.Router();
const { 
  getWorkouts, 
  getWorkout, 
  createWorkout, 
  updateWorkout, 
  deleteWorkout 
} = require('../controllers/workoutController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

router.route('/')
  .get(getWorkouts)
  .post(createWorkout);

router.route('/:id')
  .get(getWorkout)
  .put(updateWorkout)
  .delete(deleteWorkout);

module.exports = router;