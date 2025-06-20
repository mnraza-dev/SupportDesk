import app from "./server";
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import logger from './utils/logger';
import { config } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middlewares/errorHandler';
import jwt from 'jsonwebtoken';

const PORT = config.PORT;
const MONGO_URI = config.MONGO_URI;

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket, req) => {
  // Parse token from query string
  const url = req.url || '';
  const params = new URLSearchParams(url.split('?')[1]);
  const token = params.get('token');
  try {
    if (!token) throw new Error('No token');
    const user = jwt.verify(token, config.JWT_SECRET);
    // @ts-ignore
    ws.user = user; // Attach user info to ws for later use
    ws.send(JSON.stringify({ type: 'welcome', message: 'WebSocket connected' }));
  } catch (err) {
    ws.close(); // Close connection if not authenticated
    return;
  }
});

export function broadcastTicketEvent(event: any) {
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(event));
    }
  });
}

app.use(errorHandler);

connectDB(MONGO_URI).then(() => {
  server.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
});