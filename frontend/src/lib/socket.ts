import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null 

export function getSocket(): Socket {
    if (!socket) {
        // Route all socket traffic through WAF/HTTPS (443) for security compliance.
        // This allows ModSecurity to inspect WebSocket packets.
        socket = io('https://localhost', {
            path: '/socket.io',
            withCredentials: true,
            autoConnect: false,
            transports: ['websocket'], // Use WebSocket for WAF compatibility
            secure: true,              // SSL/TLS enabled
            rejectUnauthorized: false, // Required for self-signed certificates in dev env
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