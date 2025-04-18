import axios from 'axios';

// Fitbit API configuration
const FITBIT_CLIENT_ID = '23Q87Z';
const FITBIT_CLIENT_SECRET = '12d7e078c1d0e12be62c6720c12e63ff';
const FITBIT_REDIRECT_URI = window.location.origin + '/auth/fitbit/callback';
const FITBIT_AUTH_URL = 'https://www.fitbit.com/oauth2/authorize';
const FITBIT_TOKEN_URL = 'https://api.fitbit.com/oauth2/token';
const FITBIT_API_URL = 'https://api.fitbit.com';

// Store tokens in localStorage
const storeTokens = (tokens) => {
  localStorage.setItem('fitbitTokens', JSON.stringify(tokens));
};

// Get tokens from localStorage
const getTokens = () => {
  const tokensString = localStorage.getItem('fitbitTokens');
  return tokensString ? JSON.parse(tokensString) : null;
};

// Clear tokens from localStorage
const clearTokens = () => {
  localStorage.removeItem('fitbitTokens');
};

// Generate the OAuth authorization URL
const getFitbitAuthUrl = () => {
  const scopes = [
    'activity',
    'heartrate',
    'location',
    'nutrition',
    'profile',
    'settings',
    'sleep',
    'social',
    'weight'
  ].join(' ');

  const params = new URLSearchParams({
    client_id: FITBIT_CLIENT_ID,
    response_type: 'code',
    scope: scopes,
    redirect_uri: FITBIT_REDIRECT_URI
  });

  return `${FITBIT_AUTH_URL}?${params.toString()}`;
};

// Exchange authorization code for access token
const exchangeCodeForToken = async (code) => {
  try {
    const params = new URLSearchParams();
    params.append('client_id', FITBIT_CLIENT_ID);
    params.append('client_secret', FITBIT_CLIENT_SECRET);
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', FITBIT_REDIRECT_URI);

    const response = await axios.post(FITBIT_TOKEN_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const tokens = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      userId: response.data.user_id,
      tokenType: response.data.token_type,
      scope: response.data.scope,
      expiresAt: new Date(Date.now() + response.data.expires_in * 1000).toISOString()
    };

    storeTokens(tokens);
    return tokens;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

// Refresh access token
const refreshAccessToken = async () => {
  try {
    const tokens = getTokens();
    
    if (!tokens) {
      throw new Error('No tokens available to refresh');
    }
    
    const params = new URLSearchParams();
    params.append('client_id', FITBIT_CLIENT_ID);
    params.append('client_secret', FITBIT_CLIENT_SECRET);
    params.append('refresh_token', tokens.refreshToken);
    params.append('grant_type', 'refresh_token');

    const response = await axios.post(FITBIT_TOKEN_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const newTokens = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      userId: tokens.userId, // Reuse existing user ID
      tokenType: response.data.token_type,
      scope: response.data.scope,
      expiresAt: new Date(Date.now() + response.data.expires_in * 1000).toISOString()
    };

    storeTokens(newTokens);
    return newTokens;
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearTokens(); // Clear invalid tokens
    throw error;
  }
};

// Check if token is expired and refresh if needed
const getValidToken = async () => {
  const tokens = getTokens();
  
  if (!tokens) {
    return null;
  }
  
  const now = new Date();
  const expiresAt = new Date(tokens.expiresAt);
  
  // If token expires in less than 5 minutes, refresh it
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    try {
      return await refreshAccessToken();
    } catch (error) {
      clearTokens();
      return null;
    }
  }
  
  return tokens;
};

// Check if Fitbit is authenticated
const isAuthenticated = () => {
  const tokens = getTokens();
  return !!tokens;
};

// Disconnect from Fitbit
const disconnect = () => {
  clearTokens();
};

// Get Fitbit profile
const getProfile = async () => {
  try {
    const tokens = await getValidToken();
    
    if (!tokens) {
      throw new Error('Not authenticated with Fitbit');
    }
    
    const response = await axios.get(`${FITBIT_API_URL}/1/user/-/profile.json`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting Fitbit profile:', error);
    throw error;
  }
};

// Get today's heart rate
const getHeartRate = async () => {
  try {
    const tokens = await getValidToken();
    
    if (!tokens) {
      throw new Error('Not authenticated with Fitbit');
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const response = await axios.get(`${FITBIT_API_URL}/1/user/-/activities/heart/date/${today}/1d.json`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting Fitbit heart rate:', error);
    throw error;
  }
};

// Get today's steps
const getSteps = async () => {
  try {
    const tokens = await getValidToken();
    
    if (!tokens) {
      throw new Error('Not authenticated with Fitbit');
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const response = await axios.get(`${FITBIT_API_URL}/1/user/-/activities/steps/date/${today}/1d.json`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting Fitbit steps:', error);
    throw error;
  }
};

// Export all functions
const fitbitService = {
  getFitbitAuthUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  getValidToken,
  isAuthenticated,
  disconnect,
  getProfile,
  getHeartRate,
  getSteps
};

export default fitbitService;