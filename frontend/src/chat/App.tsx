import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export default function Chat({ token, friendId } : { token: string; friendId: string }) {
	const [roomId, setRoomId] = useState<string | null>(null);
	const [messages, setMessages] = useState<any[]>([]);
	const [input, setInput] = useState('');
	const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
	fetch(`/api/message/rooms/${friendId}`, {
	  method: 'POST',
	  headers: { Authorization: `Bearer ${token}` },
	})
	  .then(r => r.json())
	  .then(room => {
		setRoomId(room._id);

		// Step 2: Load history
		return fetch(`/api/message/rooms/${room._id}`, {
		  headers: { Authorization: `Bearer ${token}` },
		}).then(r => r.json()).then(msgs => setMessages(msgs.reverse()));
	  });

	// Step 3: Connect socket
	const socket = io('http://localhost:3000', { auth: { token } });
	socketRef.current = socket;

	socket.on('receiveMessage', (msg) => {
	  setMessages(prev => [...prev, msg]);
	});

	return () => { socket.disconnect(); };
  }, [friendId, token]);

  useEffect(() => {
	if (roomId && socketRef.current) {
		socketRef.current.emit('joinRoom', roomId);
	}
  }, [roomId]);

  const sendMessage = () => {
	if (!roomId || !input.trim()) return;
	socketRef.current.emit('sendMessage', { roomId, content: input });
	setInput('');
  };

  return (
	<div>
		{messages.map((m, i) => <p key={i}>{m.content}</p>)}
		<input value={input} onChange={e => setInput(e.target.value)} />
		<button onClick={sendMessage}>Send</button>
	</div>
  );
}