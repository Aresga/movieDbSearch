import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export default function Chat({ token, friendId } : { token: string; friendId: string }) {
	const [roomId, setRoomId] = useState<string | null>(null);
	const [messages, setMessages] = useState<any[]>([]);
	const [input, setInput] = useState('');
	const [messagesLoaded, setMessagesLoaded] = useState(false);
	const [roomCreated, setRoomCreated] = useState(false);
	const socketRef = useRef<Socket | null>(null);


  useEffect(() => {
	const socket = io('http://localhost:3000', { auth: { token } });
	socketRef.current = socket;

	socket.on('receiveMessage', (msg) => {
	  setMessages(prev => [...prev, msg]);
  });

  return () => {
	socket.disconnect();
  };
}, [token]);

  const loadMessages = async (nextRoom: string) => {
	
	try {
		const response = await fetch(`/api/message/rooms/${nextRoom}`, {
			headers: { Authorization: `Bearer ${token}` },
		});

	const msgs = await response.json();
	setMessages(msgs.reverse());
  } finally {
	setMessagesLoaded(true);
  }
  };

  const createRoom = async () => {
	try {
		const response = await fetch(`/api/message/rooms/${friendId}`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
		});

		const room = await response.json();
		setRoomId(room._id);

		await loadMessages(room._id);
	} finally {
		setRoomCreated(true);
	}
  };

    const sendMessage = () => {
	if (!roomId || !input.trim()) return;
	socketRef.current.emit('sendMessage', { roomId, content: input });
	setInput('');
  };


  return (
	<div>
		{!roomId && (
			<button onClick={createRoom} disabled={roomCreated}>
			{roomCreated ? 'Creating...' :'Create Room'}
			</button>
		)}
	{roomId && !messagesLoaded && <p>Loading messages</p>}
	{roomId && messagesLoaded && messages.length === 0 && <p>Start a conversation!</p>}
	{messages.map((message, index) => (
		<p key={message.id ?? index}>{message.content}</p>
	))}
	<input value={input} onChange={e => setInput(e.target.value)} disabled={!roomId}/>
	<button onClick={sendMessage} disabled={!roomId || !input.trim()}>Send</button>
	</div>
  );
}