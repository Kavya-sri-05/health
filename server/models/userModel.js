// server/models/userModel.js

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  height: {
    type: Number,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', null],
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  fitbitConnected: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);