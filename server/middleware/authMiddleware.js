const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Check if user is authenticated through session or JWT
const isAuthenticated = async (req, res, next) => {
  // First check if authenticated via passport session
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Otherwise check for JWT
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. Not authenticated.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user to make sure it exists
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
const protect = asyncHandler(async (req, res, next) => {
    let token;
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Get user from the token
        req.user = await User.findById(decoded.id).select('-password');
        next();
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    }
    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
  });

module.exports = { verifyToken, isAuthenticated, protect};