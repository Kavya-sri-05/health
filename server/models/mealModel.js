const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  notes: {
    type: String
  },
  calories: {
    type: Number,
    min: 0
  },
  protein: {
    type: Number,
    min: 0
  },
  carbs: {
    type: Number,
    min: 0
  },
  fat: {
    type: Number,
    min: 0
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'other']
  }
});

// Index for faster queries by userId
mealSchema.index({ userId: 1, date: -1 });

const Meal = mongoose.model('Meal', mealSchema);

module.exports = Meal;