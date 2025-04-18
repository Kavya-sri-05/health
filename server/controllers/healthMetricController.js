// server/controllers/healthMetricController.js
const asyncHandler = require('express-async-handler');
// Fix the import path to match where your websocket.js file actually is
const { broadcastHealthMetric } = require('../websocket');
const HealthMetric = require('../models/healthMetricModel');
const User = require('../models/userModel');

// @desc    Get all health metrics for a user
// @route   GET /api/health-metrics
// @access  Private
const getHealthMetrics = async (req, res) => {
  try {
    const metrics = await HealthMetric.find({ userId: req.user._id })
      .sort({ date: -1 });
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get health metrics',
      error: error.message
    });
  }
};

// @desc    Get a single health metric
// @route   GET /api/health-metrics/:id
// @access  Private
const getHealthMetric = async (req, res) => {
  try {
    const metric = await HealthMetric.findById(req.params.id);
    
    if (!metric) {
      return res.status(404).json({ message: 'Health metric not found' });
    }
    
    // Check if metric belongs to requesting user
    if (metric.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this metric' });
    }
    
    res.json(metric);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get health metric',
      error: error.message
    });
  }
};

// @desc    Create a new health metric
// @route   POST /api/health-metrics
// @access  Private
const createHealthMetric = async (req, res) => {
  try {
    const metric = new HealthMetric({
      ...req.body,
      userId: req.user._id
    });
    
    const createdMetric = await metric.save();
    
    // Broadcast the new metric to connected clients
    broadcastMetricToUser(req.user._id.toString(), createdMetric);
    
    res.status(201).json(createdMetric);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create health metric',
      error: error.message
    });
  }
};

// @desc    Update a health metric
// @route   PUT /api/health-metrics/:id
// @access  Private
const updateHealthMetric = async (req, res) => {
  try {
    const metric = await HealthMetric.findById(req.params.id);
    
    if (!metric) {
      return res.status(404).json({ message: 'Health metric not found' });
    }
    
    // Check if metric belongs to requesting user
    if (metric.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this metric' });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      metric[key] = req.body[key];
    });
    
    const updatedMetric = await metric.save();
    
    // Broadcast the updated metric to connected clients
    broadcastMetricToUser(req.user._id.toString(), updatedMetric);
    
    res.json(updatedMetric);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update health metric',
      error: error.message
    });
  }
};

// @desc    Delete a health metric
// @route   DELETE /api/health-metrics/:id
// @access  Private
const deleteHealthMetric = async (req, res) => {
  try {
    const metric = await HealthMetric.findById(req.params.id);
    
    if (!metric) {
      return res.status(404).json({ message: 'Health metric not found' });
    }
    
    // Check if metric belongs to requesting user
    if (metric.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this metric' });
    }
    
    await metric.deleteOne();
    
    res.json({ message: 'Health metric removed' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete health metric',
      error: error.message
    });
  }
};

// @desc    Get health metrics by date range
// @route   GET /api/health-metrics/range
// @access  Private
const getHealthMetricsByRange = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    // Build query
    const query = { 
      userId: req.user._id,
      date: { 
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    // Add type filter if provided
    if (type) {
      query.type = type;
    }
    
    const metrics = await HealthMetric.find(query).sort({ date: 1 });
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get health metrics by range',
      error: error.message
    });
  }
};

module.exports = {
  getHealthMetrics,
  getHealthMetric,
  createHealthMetric,
  updateHealthMetric,
  deleteHealthMetric,
  getHealthMetricsByRange
};