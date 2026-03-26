import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate, Navigate } from 'react-router';

type User = {
	_id: string;
	username?: string;
}

export function ChatMenuPage({ token, userId } : { token: string, userId: string }) {

	const [rooms, setRooms] = useState<any[]>([]);
	const [friendNames, setFriendNames] = useState<string[]>([]);
	const [lastMessages, setLastMessages] = useState<any[]>([]);
	const [input, setInput] = useState('');
	const [roomsLoaded, setRoomsLoaded] = useState(false);
	const [roomCreated, setRoomCreated] = useState(false);
	const socketRef = useRef<Socket | null>(null);


  useEffect(() => {
	const socket = io('http://localhost:3000', { auth: { token } });
	socketRef.current = socket;

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
	Navigate(`/chat/${roomId}`);
  };

  const getRoomsNames = async (userId: string) => {
	var secondUser;
	for (var room of rooms) {
		if (room.participants[0] == userId)
			secondUser = room.participants[1];
		else
			secondUser = room.participants[0];
		const response = await fetch(`/user/${secondUser}`);
		const friend = await response.json();
		setFriendNames(friend.username);
	}
  }

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