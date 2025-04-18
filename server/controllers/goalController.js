const asyncHandler = require('express-async-handler');
const Goal = require('../models/goalModel');
const HealthMetric = require('../models/healthMetricModel');
const Workout = require('../models/workoutModel');
const { checkGoalAchievements } = require('../utils/achievementUtils');

// Get all goals for a user
const getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(goals);
});

// Get single goal by ID
const getGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  
  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }
  
  // Check if goal belongs to user
  if (goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this goal');
  }
  
  res.json(goal);
});

// Create a new goal
const createGoal = asyncHandler(async (req, res) => {
  const { 
    title,
    category,
    targetValue,
    currentValue,
    unit,
    startDate,
    endDate,
    frequency,
    isPublic,
    metricType,
    notes
  } = req.body;
  
  if (!title || !category || targetValue === undefined) {
    res.status(400);
    throw new Error('Please provide title, category and target value');
  }
  
  const goal = await Goal.create({
    user: req.user._id,
    title,
    category,
    targetValue,
    currentValue: currentValue || 0,
    unit,
    startDate: startDate || new Date(),
    endDate,
    frequency,
    isPublic: isPublic || false,
    metricType,
    notes,
    status: 'active'
  });
  
  res.status(201).json(goal);
});

// Update a goal
const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  
  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }
  
  // Check if goal belongs to user
  if (goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this goal');
  }
  
  // Update fields
  const updatedFields = {};
  const allowedFields = [
    'title', 'category', 'targetValue', 'currentValue', 'unit',
    'startDate', 'endDate', 'frequency', 'isPublic', 'metricType',
    'notes', 'status'
  ];
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updatedFields[field] = req.body[field];
    }
  });
  
  // Update last modified date
  updatedFields.lastModified = new Date();
  
  // If currentValue meets or exceeds targetValue and status is still active, mark as completed
  if (
    updatedFields.currentValue !== undefined &&
    goal.status === 'active' &&
    updatedFields.currentValue >= (updatedFields.targetValue || goal.targetValue)
  ) {
    updatedFields.status = 'completed';
    updatedFields.completedDate = new Date();
  }
  
  const updatedGoal = await Goal.findByIdAndUpdate(
    req.params.id,
    { $set: updatedFields },
    { new: true }
  );
  
  // Check if any achievements were earned
  if (updatedGoal.status === 'completed') {
    await checkGoalAchievements(req.user._id);
  }
  
  res.json(updatedGoal);
});

// Delete a goal
const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  
  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }
  
  // Check if goal belongs to user
  if (goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this goal');
  }
  
  await goal.remove();
  
  res.json({ message: 'Goal removed' });
});

// Get goal progress
const getGoalProgress = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  
  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }
  
  // Check if goal belongs to user
  if (goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this goal');
  }
  
  let progressData = [];
  const now = new Date();
  const startDate = goal.startDate;
  
  // Calculate duration in days
  const totalDays = goal.endDate 
    ? Math.ceil((goal.endDate - startDate) / (1000 * 60 * 60 * 24))
    : Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    
  // Get progress data based on goal category
  if (goal.category === 'health_metric' && goal.metricType) {
    // Get health metrics for this goal type
    const metrics = await HealthMetric.find({
      user: req.user._id,
      type: goal.metricType,
      date: { $gte: startDate, $lte: goal.endDate || now }
    }).sort({ date: 1 });
    
    progressData = metrics.map(metric => ({
      date: metric.date,
      value: metric.value
    }));
  } 
  else if (goal.category === 'workout') {
    // Get workouts for calculating progress
    const workouts = await Workout.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: goal.endDate || now }
    }).sort({ date: 1 });
    
    // Calculate progress data based on workouts
    // For example, if goal is to work out X times per week
    if (goal.frequency === 'weekly') {
      // Group workouts by week
      const weeklyWorkouts = {};
      
      workouts.forEach(workout => {
        const workoutDate = new Date(workout.date);
        const weekStart = new Date(workoutDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyWorkouts[weekKey]) {
          weeklyWorkouts[weekKey] = 0;
        }
        
        weeklyWorkouts[weekKey]++;
      });
      
      progressData = Object.entries(weeklyWorkouts).map(([week, count]) => ({
        date: week,
        value: count
      }));
    }
    // For duration-based goals (e.g., total workout minutes)
    else if (goal.unit === 'minutes') {
      progressData = workouts.map(workout => ({
        date: workout.date,
        value: workout.duration
      }));
    }
  }
  
  // Calculate completion percentage
  let completionPercentage = 0;
  if (goal.targetValue > 0) {
    completionPercentage = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  }
  
  // Return progress stats
  const response = {
    goal,
    progressData,
    stats: {
      completionPercentage,
      totalDays,
      daysElapsed: Math.min(totalDays, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))),
      daysRemaining: goal.endDate 
        ? Math.max(0, Math.ceil((goal.endDate - now) / (1000 * 60 * 60 * 24)))
        : null
    }
  };
  
  res.json(response);
});

module.exports = {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalProgress
};