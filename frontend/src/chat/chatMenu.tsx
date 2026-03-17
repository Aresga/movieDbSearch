import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export default function ChatMenu({ token } : { token: string }) {

	const [rooms, setRooms] = useState<any[]>([]);
	const [lastMessages, setLastMessages] = useState<any[]>([]);
	const [input, setInput] = useState('');
	const [roomsLoaded, setRoomsLoaded] = useState(false);
	const [roomCreated, setRoomCreated] = useState(false);
	const socketRef = useRef<Socket | null>(null);


  useEffect(() => {
	const socket = io('http://localhost:3000', { auth: { token } });
	socketRef.current = socket;

  	return () => {
		socket.disconnect();
  };
}, [token]);

  const loadRooms = async (userId: string) => {
	try {
		const response = await fetch(`/api/rooms/${userId}`, {
			headers: { Authorization: `Bearer ${token}`},
		});
		const rooms = await response.json();
		setRooms(rooms);
	} finally {
		setRoomsLoaded(true);
	}

  }

  const createRoom = async (friendId: string) => {
	try {
		const response = await fetch(`/api/message/rooms/${friendId}`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
		});

		const room = await response.json();

	} finally {
		setRoomCreated(true);
	}
  };



  return (
	<div>
		
	<button onClick={createRoom} disabled={roomCreated}> {roomCreated ? 'Creating...' :'Create Room'} </button>
	</div>
  )

}


// {!roomId && (
// 			<button onClick={createRoom} disabled={roomCreated}>
// 			{roomCreated ? 'Creating...' :'Create Room'}
// 			</button>
// 		)}