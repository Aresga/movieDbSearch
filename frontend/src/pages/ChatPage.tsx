import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'react-router-dom';

type Message = {
	_id: string
	roomId: string
	senderId: string
	content: string
	createdAt: string
}

export function ChatPage({token, userId }: {token: string; userId: string }) {
	const { roomId } = useParams<{roomId :string}>()
	const [messages, setMessages] = useState<Message[]>([])
	const [input, setInput] = useState('')
	const [loading, setLoading] = useState(true)
	const socketRef = useRef<Socket | null>(null)

	useEffect(() => {
		if (!roomId) return

		const loadMessages = async () => {
			setLoading(true)
			try {
				const res = await fetch(`/api/message/rooms/${roomId}/messages`, {
					headers: { Authorization: `Bearer ${token}`},
				})
				const data = await res.json()
				setMessages(data.reverse())
			} finally {
				setLoading(false);
			}
		}
		loadMessages()
	}, [roomId, token])

	useEffect(() => {
		const socket = io('http://localhost:3000', { auth: { token } })
		socketRef.current = socket
		socket.emit('joinRoom')
		socket.on('receiveMessage', (msg: Message) => {
			if (msg.roomId !== roomId) return
				setMessages((prev) => [...prev, msg])
		})

		return () => socket.disconnect()
	}, [token, roomId])

	const sendMessage = () => {
		if (!roomId || !input.trim()) return
		socketRef.current?.emit('sendMessage', { roomId, content: input.trim() })
		setInput('')
	}

	return (
	<div className="chat">
		{loading && <p>Loading messages...</p>}
		{!loading && messages.length === 0 && <p>Start a conversation!</p>}

		{messages.map((m) => (
		<div key={m.id}>
		<p>{m.senderId === userId ? 'You' : m.senderId}</p>
		<p>{m.content}</p>
		<small>{new Date(m.createdAt).toLocaleString()}</small>
		</div>
		))}

		<input value={input} onChange={(e) => setInput(e.target.value)} />
		<button onClick={sendMessage} disabled={!roomId || !input.trim()}>
		Send
		</button>
	</div>
	)
}