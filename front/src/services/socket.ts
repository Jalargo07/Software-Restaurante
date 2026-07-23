import { io, Socket } from 'socket.io-client'

const socket: Socket = io('http://localhost:3000', {
  autoConnect: false,
})

export function connectSocket() {
  if (!socket.connected) {
    socket.connect()
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect()
  }
}

export { socket }
