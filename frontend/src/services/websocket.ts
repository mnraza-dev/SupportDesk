import { Client } from '@stomp/stompjs';
import store from '../store';

// Mock WebSocket URL (not actually used in mock)
const WEBSOCKET_URL = import.meta.env.VITE_BACKEND_WS_URL || 'ws://localhost:3000';

let ws: WebSocket | null = null;
const subscribers: Record<string, ((msg: any) => void)[]> = {};

function getJwt() {
  return store.getState().auth.jwt;
}

function connect() {
  if (ws && ws.readyState === 1) return;
  const jwt = getJwt();
  if (!jwt) return;
  const url = WEBSOCKET_URL + '?token=' + encodeURIComponent(jwt);
  ws = new window.WebSocket(url);
  ws.onopen = () => {
    // Optionally notify connection
  };
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // Broadcast to all topic subscribers
      if (data.type === 'NEW_TICKET' || data.type === 'TICKET_STATUS_UPDATE' || data.type === 'ticket_status_update' || data.type === 'ticket_assigned' || data.type === 'ticket_updated') {
        (subscribers['/topic/tickets'] || []).forEach(cb => cb(data));
      }
      if ((data.type === 'NEW_MESSAGE' || data.type === 'new_message') && data.ticketId) {
        (subscribers[`/topic/ticket/${data.ticketId}/messages`] || []).forEach(cb => cb(data));
      }
    } catch (e) {}
  };
  ws.onclose = () => {
    // Optionally try to reconnect
    setTimeout(connect, 2000);
  };
}

function disconnect() {
  if (ws) ws.close();
  ws = null;
}

function subscribe(topic: string, callback: (msg: any) => void): () => void {
  if (!subscribers[topic]) subscribers[topic] = [];
  subscribers[topic].push(callback);
  return () => {
    subscribers[topic] = subscribers[topic].filter(cb => cb !== callback);
  };
}

export const websocket = {
  connect,
  disconnect,
  subscribe,
}; 