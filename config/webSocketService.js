const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor() {
    this.clients = new Map(); // Map to store client connections
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', async (ws, req) => {
      try {
        const token = new URL(req.url, 'ws://localhost').searchParams.get('token');
        if (!token) {
          throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decoded._id.toString();
        
        // Store the WebSocket connection with the user ID
        this.clients.set(userId, ws);

        // Set up ping-pong to keep connection alive
        ws.isAlive = true;
        ws.on('pong', () => {
          ws.isAlive = true;
        });

        // Handle client disconnection
        ws.on('close', () => {
          this.clients.delete(userId);
        });

        // Send a connection success message
        ws.send(JSON.stringify({ type: 'CONNECTION_SUCCESS' }));

      } catch (error) {
        console.error('WebSocket authentication error:', error);
        ws.terminate();
      }
    });

    // Set up ping interval to keep connections alive
    const pingInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(pingInterval);
    });
  }

  sendNotification(userId, notification) {
    try {
      const client = this.clients.get(userId.toString());
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
        console.log(`Notification sent to user ${userId}:`, notification);
      } else {
        console.log(`No active connection for user ${userId}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();
module.exports = webSocketService;