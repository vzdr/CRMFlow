// WebSocket service for connecting to FastAPI backend
class SocketService {
  constructor() {
    this.socket = null;
    this.messageCallbacks = [];
    this.connectionCallbacks = [];
    this.disconnectionCallbacks = [];
  }

  // Connect to the WebSocket server
  connect(url = 'ws://localhost:8000/ws') {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.connectionCallbacks.forEach(callback => callback());
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.messageCallbacks.forEach(callback => callback(data));
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.socket.onclose = () => {
          console.log('WebSocket disconnected');
          this.disconnectionCallbacks.forEach(callback => callback());
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect from the WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // Send a message to the server
  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const data = typeof message === 'string'
        ? message
        : JSON.stringify(message);
      this.socket.send(data);
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // Register a callback for incoming messages
  onMessage(callback) {
    this.messageCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  // Register a callback for connection events
  onConnection(callback) {
    this.connectionCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  // Register a callback for disconnection events
  onDisconnection(callback) {
    this.disconnectionCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.disconnectionCallbacks = this.disconnectionCallbacks.filter(cb => cb !== callback);
    };
  }

  // Check if connected
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create and export a singleton instance
const socketService = new SocketService();

export default socketService;
