import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export interface AuthenticatedSocket extends Socket {
  data: Socket['data'] & {
    tenantId?: number;
    userId?: number;
    rol?: string;
  };
}

export function authenticateSocket(socket: AuthenticatedSocket, next: (err?: Error) => void) {
  const token = (socket.handshake.auth.token as string | undefined)
    || (socket.handshake.query.token as string | undefined)
    || (socket.handshake.headers.authorization?.split(' ')[1]);

  if (!token) {
    return next(new Error('Token requerido'));
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) return next(new Error('Token inválido o expirado'));
    socket.data.tenantId = decoded.tenantId;
    socket.data.userId = decoded.id;
    socket.data.rol = decoded.rol;
    next();
  });
}
