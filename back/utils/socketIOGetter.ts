import { Server } from 'socket.io';

let io: Server | null = null;

export function setSocketIOGetter(server: Server) {
  io = server;
}

export function getSocketIO(): Server | null {
  return io;
}
