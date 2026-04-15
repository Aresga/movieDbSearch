import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
    if (!socket) {
        socket = io({
            path: '/socket.io/',
            withCredentials: true,
            autoConnect: true,
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 5000,
            timeout: 10000,
        })
    }
    return socket
}

export function disconnectSocket() {
    if (socket?.connected) {
        socket.disconnect()
    }
    socket = null
}