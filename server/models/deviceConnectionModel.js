const mongoose = require('mongoose');

const deviceConnectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  service: {
    type: String,
    required: true,
    enum: ['fitbit', 'garmin', 'applehealth', 'googlefit', 'samsunghealth', 'smartphone']
  },
  active: {
    type: Boolean,
    default: true
  },
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  expiresAt: {
    type: Date
  },
  lastSync: {
    type: Date
  }
});

// Index for faster queries by userId
deviceConnectionSchema.index({ userId: 1, service: 1 });

const DeviceConnection = mongoose.model('DeviceConnection', deviceConnectionSchema);

module.exports = DeviceConnection;