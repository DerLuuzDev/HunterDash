const { API, WEBSOCKET, POISSON } = require('../build-config/constants');

class ApiService {
  constructor() {
    this.baseUrl = API.BASE_URL;
    this.timeout = API.TIMEOUT;
    this.ws = null;
    this.wsReconnectAttempts = 0;
    this.wsCallbacks = new Map();
  }
  
  setBaseUrl(url) {
    this.baseUrl = url;
  }
  
  async fetchWithTimeout(url, options = {}, timeout = this.timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  async healthCheck() {
    try {
      return await this.fetchWithTimeout(API.ENDPOINTS.HEALTH);
    } catch (error) {
      console.error('API: Health Check fehlgeschlagen:', error.message);
      return { status: 'error', message: error.message };
    }
  }
  
  async calculatePoisson(data) {
    try {
      const result = await this.fetchWithTimeout(API.ENDPOINTS.CALCULATE, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return { success: true, data: result };
    } catch (error) {
      console.error('API: Berechnung fehlgeschlagen:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  connectWebSocket() {
    if (!WEBSOCKET.ENABLED || this.ws) {
      return;
    }
    
    try {
      this.ws = new WebSocket(WEBSOCKET.URL);
      
      this.ws.onopen = () => {
        console.log('WebSocket: Verbindung hergestellt');
        this.wsReconnectAttempts = 0;
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const callback = this.wsCallbacks.get(message.id);
          if (callback) {
            callback(message.data);
            this.wsCallbacks.delete(message.id);
          }
        } catch (error) {
          console.error('WebSocket: Fehler beim Parsen der Nachricht:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket: Fehler:', error);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket: Verbindung geschlossen');
        this.ws = null;
        this.attemptReconnect();
      };
      
    } catch (error) {
      console.error('WebSocket: Verbindungsfehler:', error);
    }
  }
  
  attemptReconnect() {
    if (this.wsReconnectAttempts >= WEBSOCKET.MAX_RECONNECT_ATTEMPTS) {
      console.error('WebSocket: Maximale Reconnect-Versuche erreicht');
      return;
    }
    
    this.wsReconnectAttempts++;
    setTimeout(() => {
      console.log(`WebSocket: Reconnect-Versuch ${this.wsReconnectAttempts}`);
      this.connectWebSocket();
    }, WEBSOCKET.RECONNECT_INTERVAL);
  }
  
  sendWebSocketRequest(data) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket nicht verbunden'));
        return;
      }
      
      const id = Date.now().toString();
      this.wsCallbacks.set(id, resolve);
      
      this.ws.send(JSON.stringify({ id, ...data }));
      
      setTimeout(() => {
        if (this.wsCallbacks.has(id)) {
          this.wsCallbacks.delete(id);
          reject(new Error('Timeout'));
        }
      }, this.timeout);
    });
  }
  
  async calculatePoissonWebSocket(data) {
    try {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.connectWebSocket();
        throw new Error('WebSocket noch nicht verbunden');
      }
      
      const result = await this.sendWebSocketRequest({
        type: 'calculate',
        data
      });
      
      return { success: true, data: result };
    } catch (error) {
      console.error('WebSocket: Berechnung fehlgeschlagen:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

const apiService = new ApiService();

module.exports = apiService;
