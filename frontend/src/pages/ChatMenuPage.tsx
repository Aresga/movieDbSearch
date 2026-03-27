import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router';

type User = {
	_id: string;
	username?: string;
}

type Room = {
	_id: string;
	participans: User[];
	lastMessage?: Message | null;
	updatedAt?: string;
}

type Message = {
	id: string;
	roomId: string;
	senderId: string;
	content: string;
	timestamp: string;
}

export function ChatMenuPage({ token, userId } : { token: string, userId: string }) {

	const [rooms, setRooms] = useState<Room[]>([]);
	const [roomsLoaded, setRoomsLoaded] = useState(false);
	const [roomCreated, setRoomCreated] = useState(false);
	const socketRef = useRef<Socket | null>(null);


  useEffect(() => {


	loadRooms();
  	return () => {
		socket.disconnect();
  };
}, [token]);

  const loadRooms = async () => {
	try {
		const response = await fetch(`menu/rooms`, {
			headers: { Authorization: `Bearer ${token}`},
		});
		const rooms = await response.json();
		setRooms(rooms);
	} finally {
		setRoomsLoaded(true);
	}
  }

  useEffect(() => {
	const socket = io('http://localhost:3000', { auth: { token } });
	socketRef.current = socket;

	socket.on('receiveMessage', (message: Message) => {
		setRooms((prev) => {
			const next = prev.map((room) => {
				if (room._id !== message.roomId) return room;
				return {
					...room,
					lastMessage: { _id: message.id, content: message.content },
					updatedAt: message.timestamp,
				};
			});
			next.sort((a, b) =>
				new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
		);
		return next
		});
	})
  });

  const getFriendName = async (participants: User[]) => {
	return participants.find((p) => p._id !== userId);
  }

  const createRoom = async (friendId: string) => {
	setRoomCreated(false);
	try {
		const response = await fetch(`/rooms/create`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
		});
		const room = await response.json();
		setRooms(room);
	} finally {
		setRoomCreated(true);
	}
  };

  const openRoom = (roomId: string) => {
	useNavigate(`/chat/${roomId}`);
  };


  return (
	<div>
		<menu>
			{!roomsLoaded && <p>Loading Messages...</p> }
			{if roomsLoaded && rooms.map((room) =>
			const friend = getOtherParticipant(room.participants)
			const otherName = other?.username
			const prevMessage = room.lastMessage

			return (
				<li key={room._id} className="room" onClick={() => openRoom(room._id)}><div>{otherName}</div>
				<small>{preview}</small>
				</li>
			);
			)}
		</menu>
	</div>
  )

}



// {!roomId && (
// 			<button onClick={createRoom} disabled={roomCreated}>
// 			{roomCreated ? 'Creating...' :'Create Room'}
// 			</button>
//		<h1>Create new chat!</h1>
//	<button onClick={createRoom} disabled={roomCreated}> {roomCreated ? 'Creating...' :'Create Room'} </button>
// 		)}