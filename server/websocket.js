const WebSocket = require('ws');

// Store active connections
const clients = new Map();

// Set up WebSocket server
const setupWebSocket = (server) => {
  // Create WebSocket server
  const wss = new WebSocket.Server({ 
    server, 
    path: '/api/health-metrics-ws' 
  });

  console.log('WebSocket server initialized');

  // Connection handler
  wss.on('connection', (ws, req) => {
    // Get user ID from URL query parameters or cookies
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      console.log('Connection attempt without userId');
      ws.close(4000, 'User ID is required');
      return;
    }

    // Generate a unique client ID
    const clientId = `${userId}-${Date.now()}`;
    
    // Store client connection
    clients.set(clientId, {
      userId,
      connection: ws,
      connectedAt: new Date(),
      devices: new Set()
    });

    console.log(`Client connected: ${clientId} (User: ${userId})`);

    // Handle messages from client
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleClientMessage(clientId, data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Handle client disconnection
    ws.on('close', () => {
      console.log(`Client disconnected: ${clientId}`);
      clients.delete(clientId);
    });

    // Send initial connection acknowledgment
    ws.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      clientId
    }));
  });

  return wss;
};

// Handle messages from connected clients
const handleClientMessage = (clientId, data) => {
  const client = clients.get(clientId);
  
  if (!client) {
    console.warn(`Message received from unknown client: ${clientId}`);
    return;
  }

  // Process message based on type
  switch (data.type) {
    case 'register_device':
      // Register a new device for this client
      client.devices.add(data.deviceId);
      console.log(`Device ${data.deviceId} registered for client ${clientId}`);
      break;

    case 'unregister_device':
      // Remove a device for this client
      client.devices.delete(data.deviceId);
      console.log(`Device ${data.deviceId} unregistered for client ${clientId}`);
      break;

    case 'health_metric':
      // Process and store health metric data
      console.log(`Health metric received from client ${clientId}:`, data.metric);
      
      // In a real application, you'd store this data in your database
      // storeHealthMetric(client.userId, data.metric);
      
      // Acknowledge receipt
      client.connection.send(JSON.stringify({
        type: 'metric_ack',
        metricId: data.metric.id || data.metric.timestamp,
        status: 'received'
      }));
      break;

    default:
      console.log(`Unknown message type from client ${clientId}:`, data.type);
  }
};

// Broadcast health metric data to all clients for a specific user
const broadcastMetricToUser = (userId, metric) => {
  // Find all clients for this user
  for (const [clientId, client] of clients.entries()) {
    if (client.userId === userId && client.connection.readyState === WebSocket.OPEN) {
      client.connection.send(JSON.stringify({
        type: 'health_metric_update',
        metric
      }));
    }
  }
};

// Broadcast general notification to all connected clients
const broadcastNotification = (notification) => {
  for (const [clientId, client] of clients.entries()) {
    if (client.connection.readyState === WebSocket.OPEN) {
      client.connection.send(JSON.stringify({
        type: 'notification',
        notification
      }));
    }
  }
};

// Broadcast achievement notification to a specific user
const broadcastAchievement = (userId, achievement) => {
  for (const [clientId, client] of clients.entries()) {
    if (client.userId === userId && client.connection.readyState === WebSocket.OPEN) {
      client.connection.send(JSON.stringify({
        type: 'achievement',
        achievement
      }));
    }
  }
};

module.exports = {
  setupWebSocket,
  broadcastMetricToUser,
  broadcastNotification,
  broadcastAchievement
};