// server/controllers/userController.js

const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !username || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Check if user exists by email or username
  const userExists = await User.findOne({ 
    $or: [{ email }, { username }] 
  });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user with proper error handling
  try {
    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
    });

    if (user) {
      // Send back user data with token
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400);
    if (error.code === 11000) { // MongoDB duplicate key error
      throw new Error('Username or email already exists');
    } else {
      throw new Error(error.message || 'Invalid user data');
    }
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Check for username
  const user = await User.findOne({ username });

  // Check if user exists and password matches
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user should be set from auth middleware
  const user = await User.findById(req.user._id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  res.status(200).json(user);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Fields to update
  const fieldsToUpdate = {};
  const allowedFields = ['firstName', 'lastName', 'email', 'height', 'gender', 'dateOfBirth'];
  
  // Only add fields that are present in the request
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate[field] = req.body[field];
    }
  });
  
  // Handle password update separately
  if (req.body.currentPassword && req.body.newPassword) {
    // Verify current password
    const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
    
    if (!isMatch) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    fieldsToUpdate.password = await bcrypt.hash(req.body.newPassword, salt);
  }
  
  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: fieldsToUpdate },
    { new: true }
  ).select('-password');
  
  res.status(200).json(updatedUser);
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};