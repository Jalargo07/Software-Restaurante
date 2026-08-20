import { Server, Socket } from 'socket.io';
import { authenticateSocket, AuthenticatedSocket } from '../middleware/socketAuth';

const AUTH_TIMEOUT_MS = 30000;

export function initializeSocketHandlers(io: Server) {
  io.use(authenticateSocket);

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Socket conectado: ${socket.id}, tenant: ${socket.data.tenantId}`);

    const tenantId = socket.data.tenantId;
    if (tenantId) {
      socket.join(`tenant:${tenantId}`);
    }

    const authTimeout = setTimeout(() => {
      if (!socket.data.tenantId) {
        console.log(`Socket ${socket.id} autenticación timeout`);
        socket.disconnect(true);
      }
    }, AUTH_TIMEOUT_MS);

    socket.on('disconnect', () => {
      clearTimeout(authTimeout);
      console.log(`Socket desconectado: ${socket.id}`);
    });
  });
}
