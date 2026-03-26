import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null 

export function getSocket(): Socket {
    if (!socket) {
        socket = io('/', {
            path: '/socket.io',
            withCredentials: true,
            autoConnect: false,
            transports: ['websocket'],
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