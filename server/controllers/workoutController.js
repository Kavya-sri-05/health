const Workout = require('../models/workoutModel');

// @desc    Get all workouts for a user
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user._id })
      .sort({ date: -1 });
    
    res.json(workouts);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get workouts',
      error: error.message
    });
  }
};

// @desc    Get a single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Check if workout belongs to requesting user
    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this workout' });
    }
    
    res.json(workout);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get workout',
      error: error.message
    });
  }
};

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res) => {
  try {
    const workout = new Workout({
      ...req.body,
      userId: req.user._id
    });
    
    const createdWorkout = await workout.save();
    
    res.status(201).json(createdWorkout);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create workout',
      error: error.message
    });
  }
};

// @desc    Update a workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Check if workout belongs to requesting user
    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this workout' });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      workout[key] = req.body[key];
    });
    
    const updatedWorkout = await workout.save();
    
    res.json(updatedWorkout);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update workout',
      error: error.message
    });
  }
};

// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Check if workout belongs to requesting user
    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this workout' });
    }
    
    await workout.deleteOne();
    
    res.json({ message: 'Workout removed' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete workout',
      error: error.message
    });
  }
};

module.exports = {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout
};