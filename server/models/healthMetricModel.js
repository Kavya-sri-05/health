const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['heartRate', 'steps', 'weight', 'bloodPressureSystolic', 'bloodPressureDiastolic', 'bloodSugar', 'sleepHours', 'water', 'caloriesBurned']
  },
  value: {
    type: Number,
    required: true
  },
  weight: {
    type: Number
  },
  height: {
    type: Number
  },
  bloodPressureSystolic: {
    type: Number
  },
  bloodPressureDiastolic: {
    type: Number
  },
  heartRate: {
    type: Number
  },
  bloodSugar: {
    type: Number
  },
  sleepHours: {
    type: Number
  },
  stepsCount: {
    type: Number
  },
  notes: {
    type: String
  }
});

// Index for faster queries by userId and type
healthMetricSchema.index({ userId: 1, type: 1, date: -1 });

const HealthMetric = mongoose.model('HealthMetric', healthMetricSchema);

module.exports = HealthMetric;