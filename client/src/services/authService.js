// client/src/services/authService.js

import axios from 'axios';

const API_URL = '/api/users/';

// Register user
const register = async (userData) => {
  try {
    const response = await axios.post(API_URL + 'register', userData);
    
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error in service:', error.response?.data || error.message);
    throw error;
  }
};

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get current user
const getCurrentUser = async () => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.get(API_URL + 'me', config);
  return response.data;
};

// Update user profile
const updateProfile = async (userData) => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.put(API_URL + 'profile', userData, config);
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
};

export default authService;