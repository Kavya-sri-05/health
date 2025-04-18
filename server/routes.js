const userRoutes = require('./routes/userRoutes');
const healthMetricRoutes = require('./routes/healthMetricRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const mealRoutes = require('./routes/mealRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const { setupWebSocket } = require('./websocket');
const setupAuth = require('./auth');

/**
 * Register API routes and set up WebSocket server
 * @param {express.Express} app - Express application
 * @returns {object} - HTTP server instance and WebSocket server
 */
function registerRoutes(app) {
  // Set up authentication
  setupAuth(app);
  
  // API routes
  app.use('/api/users', userRoutes);
  app.use('/api/health-metrics', healthMetricRoutes);
  app.use('/api/workouts', workoutRoutes);
  app.use('/api/meals', mealRoutes);
  app.use('/api/medications', medicationRoutes);
  
  // Create HTTP server
  const http = require('http');
  const httpServer = http.createServer(app);
  
  // Set up WebSocket server
  const wss = setupWebSocket(httpServer);
  
  return { httpServer, wss };
}

module.exports = registerRoutes;