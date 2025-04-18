const Meal = require('../models/mealModel');

// @desc    Get all meals for a user
// @route   GET /api/meals
// @access  Private
const getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.user._id })
      .sort({ date: -1 });
    
    res.json(meals);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get meals',
      error: error.message
    });
  }
};

// @desc    Get a single meal
// @route   GET /api/meals/:id
// @access  Private
const getMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    
    // Check if meal belongs to requesting user
    if (meal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this meal' });
    }
    
    res.json(meal);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get meal',
      error: error.message
    });
  }
};

// @desc    Create a new meal
// @route   POST /api/meals
// @access  Private
const createMeal = async (req, res) => {
  try {
    const meal = new Meal({
      ...req.body,
      userId: req.user._id
    });
    
    const createdMeal = await meal.save();
    
    res.status(201).json(createdMeal);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create meal',
      error: error.message
    });
  }
};

// @desc    Update a meal
// @route   PUT /api/meals/:id
// @access  Private
const updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    
    // Check if meal belongs to requesting user
    if (meal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this meal' });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      meal[key] = req.body[key];
    });
    
    const updatedMeal = await meal.save();
    
    res.json(updatedMeal);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update meal',
      error: error.message
    });
  }
};

// @desc    Delete a meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    
    // Check if meal belongs to requesting user
    if (meal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this meal' });
    }
    
    await meal.deleteOne();
    
    res.json({ message: 'Meal removed' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete meal',
      error: error.message
    });
  }
};

module.exports = {
  getMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal
};