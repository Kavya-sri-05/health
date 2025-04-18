const asyncHandler = require('express-async-handler');
const axios = require('axios');
const DeviceConnection = require('../models/deviceModel');
const User = require('../models/userModel');

// Generate Fitbit authorization URL
const getFitbitAuthUrl = asyncHandler(async (req, res) => {
  const clientId = process.env.FITBIT_CLIENT_ID;
  const redirectUri = `${process.env.BASE_URL}/api/devices/fitbit/callback`;
  const scope = 'activity heartrate location nutrition profile settings sleep weight';
  
  const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&expires_in=604800`;
  
  res.json({ authUrl });
});

// Handle Fitbit OAuth callback
const handleFitbitCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  const userId = req.query.state; // Using state to pass userId
  
  if (!code) {
    res.status(400);
    throw new Error('Authorization code not received');
  }
  
  try {
    // Exchange authorization code for access token
    const clientId = process.env.FITBIT_CLIENT_ID;
    const clientSecret = process.env.FITBIT_CLIENT_SECRET;
    const redirectUri = `${process.env.BASE_URL}/api/devices/fitbit/callback`;
    
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://api.fitbit.com/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      data: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`
    });
    
    const { access_token, refresh_token, expires_in, user_id } = tokenResponse.data;
    
    // Get user profile from Fitbit
    const profileResponse = await axios({
      method: 'get',
      url: 'https://api.fitbit.com/1/user/-/profile.json',
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    const fitbitProfile = profileResponse.data.user;
    
    // Create or update device connection
    let deviceConnection = await DeviceConnection.findOne({
      user: userId,
      provider: 'fitbit',
      providerId: user_id
    });
    
    if (deviceConnection) {
      // Update existing connection
      deviceConnection.accessToken = access_token;
      deviceConnection.refreshToken = refresh_token;
      deviceConnection.expiresIn = expires_in;
      deviceConnection.lastSync = new Date();
      deviceConnection.providerData = fitbitProfile;
      
      await deviceConnection.save();
    } else {
      // Create new connection
      deviceConnection = await DeviceConnection.create({
        user: userId,
        provider: 'fitbit',
        providerId: user_id,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        providerData: fitbitProfile
      });
    }
    
    // Redirect to frontend callback page
    res.redirect(`/fitbit/callback?success=true`);
  } catch (error) {
    console.error('Fitbit OAuth error:', error.response?.data || error.message);
    res.redirect(`/fitbit/callback?success=false&error=${encodeURIComponent(error.message)}`);
  }
});

// Get all device connections for user
const getDeviceConnections = asyncHandler(async (req, res) => {
  const connections = await DeviceConnection.find({ user: req.user._id });
  
  // Remove sensitive data before sending to client
  const safeConnections = connections.map(conn => {
    const { accessToken, refreshToken, ...safeData } = conn.toObject();
    return safeData;
  });
  
  res.json(safeConnections);
});

// Get specific device connection
const getDeviceConnection = asyncHandler(async (req, res) => {
  const connection = await DeviceConnection.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!connection) {
    res.status(404);
    throw new Error('Device connection not found');
  }
  
  // Remove sensitive data before sending to client
  const { accessToken, refreshToken, ...safeData } = connection.toObject();
  
  res.json(safeData);
});

// Create device connection
const createDeviceConnection = asyncHandler(async (req, res) => {
  const { provider, providerId, providerData } = req.body;
  
  // Check if connection already exists
  const existingConnection = await DeviceConnection.findOne({
    user: req.user._id,
    provider,
    providerId
  });
  
  if (existingConnection) {
    res.status(400);
    throw new Error('Device connection already exists');
  }
  
  // Create connection
  const connection = await DeviceConnection.create({
    user: req.user._id,
    provider,
    providerId,
    providerData
  });
  
  res.status(201).json(connection);
});

// Update device connection
const updateDeviceConnection = asyncHandler(async (req, res) => {
  const connection = await DeviceConnection.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!connection) {
    res.status(404);
    throw new Error('Device connection not found');
  }
  
  // Update fields
  const { name, isActive, settings } = req.body;
  
  if (name !== undefined) connection.name = name;
  if (isActive !== undefined) connection.isActive = isActive;
  if (settings) connection.settings = { ...connection.settings, ...settings };
  
  connection.lastUpdated = new Date();
  
  await connection.save();
  
  res.json(connection);
});

// Delete device connection
const deleteDeviceConnection = asyncHandler(async (req, res) => {
  const connection = await DeviceConnection.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!connection) {
    res.status(404);
    throw new Error('Device connection not found');
  }
  
  await connection.remove();
  
  res.json({ message: 'Device connection removed' });
});

// Sync data from device
const syncDeviceData = asyncHandler(async (req, res) => {
  const connection = await DeviceConnection.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!connection) {
    res.status(404);
    throw new Error('Device connection not found');
  }
  
  if (connection.provider === 'fitbit') {
    // Implement Fitbit data sync
    try {
      // Fetch activity data
      const activityResponse = await axios({
        method: 'get',
        url: `https://api.fitbit.com/1/user/-/activities/date/today.json`,
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`
        }
      });
      
      // Fetch heart rate data
      const heartRateResponse = await axios({
        method: 'get',
        url: `https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json`,
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`
        }
      });
      
      // Process and save data
      // ... implementation details ...
      
      // Update last sync time
      connection.lastSync = new Date();
      await connection.save();
      
      res.json({ message: 'Device data synced successfully' });
    } catch (error) {
      console.error('Fitbit sync error:', error.response?.data || error.message);
      
      // Handle token expiration
      if (error.response && error.response.status === 401) {
        // Token expired, refresh token
        // ... implementation details ...
        res.status(401);
        throw new Error('Authentication token expired. Please reconnect your Fitbit device.');
      }
      
      throw error;
    }
  } else {
    res.status(400);
    throw new Error(`Sync not implemented for provider: ${connection.provider}`);
  }
});

module.exports = {
  getFitbitAuthUrl,
  handleFitbitCallback,
  getDeviceConnections,
  getDeviceConnection,
  createDeviceConnection,
  updateDeviceConnection,
  deleteDeviceConnection,
  syncDeviceData
};