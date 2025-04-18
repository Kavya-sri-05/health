require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const connectDB = require('./db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { setupWebSocketServer } = require('./websocket');
// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Create HTTP server
const httpServer = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/health-metrics', require('./routes/healthMetricRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/medications', require('./routes/medicationRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));

// Register additional routes and set up WebSocket server
// Import routes function correctly based on its implementation
const websocketSetup = require('./websocket');
const { setupWebSocket } = require('./websocket');
setupWebSocket(httpServer);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Catch-all route to return the React app in production
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});