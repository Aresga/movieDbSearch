import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null 

export function getSocket(): Socket {
    if (!socket) {
        // Route all socket traffic through WAF/HTTPS (443) for security compliance.
        // This allows ModSecurity to inspect WebSocket packets.
        socket = io('https://localhost', {
            path: '/socket.io/',
            withCredentials: true,
            autoConnect: true,
            transports: ['websocket'], // Use WebSocket for WAF compatibility
            secure: true,              // SSL/TLS enabled
            rejectUnauthorized: false, // Required for self-signed certificates in dev env
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