const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: false
  },
  description: {
    type: String
  },
  targetValue: {
    type: Number
  },
  currentValue: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['fitness', 'nutrition', 'sleep', 'weight', 'medication', 'other']
  },
  deadline: {
    type: Date
  }
});

// Index for faster queries by userId
goalSchema.index({ userId: 1, completed: 1 });

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;