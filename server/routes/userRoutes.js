const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe, 
  updateProfile 
} = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes - using isAuthenticated instead of protect
router.get('/me', isAuthenticated, getMe);
router.put('/profile', isAuthenticated, updateProfile);

module.exports = router;