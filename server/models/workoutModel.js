const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['cardio', 'strength', 'flexibility', 'balance', 'other']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  date: {
    type: Date,
    required: true
  },
  caloriesBurned: {
    type: Number,
    min: 0
  },
  notes: {
    type: String
  },
  location: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  }
});

// Index for faster queries by userId
workoutSchema.index({ userId: 1, date: -1 });

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;