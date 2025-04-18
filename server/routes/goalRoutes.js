const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Import goal controller functions
const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalProgress
} = require('../controllers/goalController');

// Goal routes
router.route('/')
  .get(protect, getGoals)
  .post(protect, createGoal);

router.route('/:id')
  .get(protect, getGoal)
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

// Goal progress route
router.get('/:id/progress', protect, getGoalProgress);

module.exports = router;