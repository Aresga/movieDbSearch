import React, { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useFriends } from '@/hooks/useFriends';

type IdLike = { id?: string; _id?: string };

type User = IdLike & {
  username?: string;
};

type Room = {
  _id: string;
  participants: User[];
  lastMessage?: Message | null;
  updatedAt?: string;
};

type Message = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
};

type Friend = IdLike & {
  username?: string;
};

export function ChatMenuPage({ token, userId }: { token: string; userId: string }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showFriends, setShowFriends] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const navigate = useNavigate();

  const { data: friends = [], isLoading: isFriendsLoading } = useFriends();

  const getId = (value: IdLike | undefined) => value?.id ?? value?._id ?? '';

  useEffect(() => {
    const loadRooms = async () => {
      const response = await fetch('/api/menu/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Room[] = await response.json();
      data.sort(
        (a, b) =>
          new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
      );
      setRooms(data);
    };

    loadRooms();
  }, [token]);

  useEffect(() => {
    const socket = io('http://localhost:3000', { auth: { token } });

    socket.on('receiveMessage', (message: Message) => {
      setRooms((prev) => {
        const next = prev.map((room) =>
          room._id !== message.roomId
            ? room
            : { ...room, lastMessage: message, updatedAt: message.timestamp }
        );

        next.sort(
          (a, b) =>
            new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
        );
        return next;
      });
    });

    return () => socket.disconnect();
  }, [token]);

  const existingChatFriendIds = useMemo(() => {
    return new Set(
      rooms
        .map((room) => room.participants.find((p) => getId(p) !== userId))
        .map((p) => getId(p))
        .filter(Boolean)
    );
  }, [rooms, userId]);

  const validFriends = useMemo(() => {
    return (friends as Friend[]).filter((f) => {
      const fid = getId(f);
      return !!fid && fid !== userId && !existingChatFriendIds.has(fid);
    });
  }, [friends, existingChatFriendIds, userId]);

  const createRoom = async (friendId: string) => {
    setIsCreatingRoom(true);
    try {
      const response = await fetch(`/api/message/rooms/create/${friendId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const room: Room = await response.json();

      setRooms((prev) => {
        const exists = prev.some((r) => r._id === room._id);
        const next = exists ? prev.map((r) => (r._id === room._id ? room : r)) : [room, ...prev];
        next.sort(
          (a, b) =>
            new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
        );
        return next;
      });

      navigate(`/rooms/${room._id}`);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  return (
    <div>
      <button onClick={() => setShowFriends((v) => !v)} disabled={isCreatingRoom}>
        Create a new chat!
      </button>

      {showFriends && (
        <div>
          {isFriendsLoading ? (
            <p>Loading friends...</p>
          ) : validFriends.length === 0 ? (
            <p>You are already talking to everyone!</p>
          ) : (
            validFriends.map((friend) => {
              const friendId = getId(friend);
              return (
                <button
                  key={friendId}
                  onClick={() => createRoom(friendId)}
                  disabled={isCreatingRoom}
                >
                  Start a new chat with {friend.username ?? 'Unknown user'}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}