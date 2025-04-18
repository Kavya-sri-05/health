const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badgeId: {
    type: String,
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  metadata: {
    type: String
  }
});

// Index for faster queries by userId
achievementSchema.index({ userId: 1, badgeId: 1 });

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;