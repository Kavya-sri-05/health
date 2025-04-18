const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
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
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  notes: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  }
});

// Index for faster queries by userId
medicationSchema.index({ userId: 1, active: 1 });

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;