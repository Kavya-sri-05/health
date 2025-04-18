const express = require('express');
const router = express.Router();
const { 
  getMeals, 
  getMeal, 
  createMeal, 
  updateMeal, 
  deleteMeal 
} = require('../controllers/mealController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

router.route('/')
  .get(getMeals)
  .post(createMeal);

router.route('/:id')
  .get(getMeal)
  .put(updateMeal)
  .delete(deleteMeal);

module.exports = router;