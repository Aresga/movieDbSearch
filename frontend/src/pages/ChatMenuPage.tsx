import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFriends } from '@/hooks/useFriends';
import type { User } from '@/types'
import { apiClient } from '@/api/client';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import { BellRing } from 'lucide-react';

type IdLike = { id?: string; _id?: string };

type Room = {
  _id: string;
  participants: User[];
  lastMessage?: Message | null;
  updatedAt?: string;
  isUnRead: boolean;
};

type Message = {
  _id: string;
  roomId: string;
  senderId: string | IdLike;
  content: string;
  createdAt: string;
  read: boolean;
};

type Friend = IdLike & {
  username?: string;
};

export function ChatMenuPage() {
  const { token, user, setUnreadMessages } = useAuthStore(); // weird place to put this but it works for now
  const userId = user?.id ?? '';
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showFriends, setShowFriends] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const navigate = useNavigate();

  const { data: friends = [], isLoading: isFriendsLoading } = useFriends();

  const getId = (value: IdLike | undefined) => value?.id ?? value?._id ?? '';

  // Sync unread status to auth store
  useEffect(() => {
    const hasUnread = rooms.some(r => r.isUnRead);
    setUnreadMessages?.(hasUnread);
  }, [rooms, setUnreadMessages]);

  useEffect(() => {
    const loadRooms = async () => {
      try {
      const response = await apiClient.get('/message/menu/rooms');
      const data = response.data as Omit<Room, 'isUnRead'>[];
      if (Array.isArray(data)) {
        const marked = data.map(markAsUnread);
        marked.sort(
          (a, b) =>
            new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
        );
        setRooms(marked);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error("Failed to load rooms", error);
      setRooms([]);
    }
    };

    loadRooms();
  }, [token, userId]);

  useEffect(() => {
    const socket = getSocket();

    const handleReceiveMessage = (message: Message) => {
      setRooms((prev) => {
        const next = prev.map((room) =>
          room._id !== message.roomId
            ? room
            : {
                ...room,
                lastMessage: message,
                updatedAt: message.createdAt,
                isUnRead:
                  !!userId &&
                  message.senderId !== userId &&
                  message.read === false,
              }
        );

        next.sort(
          (a, b) =>
            new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
        );
        return next;
      });
    };

    const handleMarkAsRead = (data: { roomId: string; readBy: string }) => {
      if (data.readBy !== userId) return;

      setRooms((prev) =>
        prev.map((room) =>
          room._id === data.roomId
            ? {
                ...room,
                isUnRead: false,
                lastMessage: room.lastMessage
                  ? { ...room.lastMessage, read: true }
                  : room.lastMessage,
              }
            : room,
        ),
      );
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('markAsRead', handleMarkAsRead);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('markAsRead', handleMarkAsRead);
    };

  }, [token, userId]);

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
      const response = await apiClient.post(`/message/rooms/create/${friendId}`)
      const room = markAsUnread(response.data as Omit<Room, 'isUnRead'>);

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

  const markAsUnread = (room: Omit<Room, 'isUnRead'>): Room => {
    const senderId = room.lastMessage ? room.lastMessage.senderId : '';
    const hasUnread =
      !!room.lastMessage &&
      !!userId &&
      !!senderId &&
      senderId !== userId &&
      room.lastMessage.read === false;

    return {
      ...room,
      isUnRead: hasUnread,
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 space-y-6">
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-card-foreground">Chats</h1>
          <button
            onClick={() => setShowFriends((v) => !v)}
            disabled={isCreatingRoom}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showFriends ? 'Close' : 'Create a new chat'}
          </button>
        </div>

        {showFriends && (
          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
            {isFriendsLoading ? (
              <p className="text-sm text-muted-foreground">Loading friends...</p>
            ) : validFriends.length === 0 ? (
              <p className="text-sm text-muted-foreground">You are already talking to everyone!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {validFriends.map((friend) => {
                  const friendId = getId(friend);
                  return (
                    <button
                      key={friendId}
                      onClick={() => createRoom(friendId)}
                      disabled={isCreatingRoom}
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Start chat with {friend.username ?? 'Unknown user'}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your conversations</h2>

        {rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No chats yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rooms.map((room) => {
              const otherParticipant = room.participants.find((p) => getId(p) !== userId);
              const friendName = otherParticipant?.username ?? 'Unknown user';

              return (
                <li key={room._id}>
                  <Link
                    to={`/rooms/${room._id}`}
                    onClick={() => {
                      setRooms((prev) =>
                        prev.map((r) =>
                          r._id === room._id ? { ...r, isUnRead: false } : r,
                        ),
                      );
                    }}
                    className="block overflow-hidden py-3 text-foreground transition hover:text-primary"
                  >
                    <span className="font-medium">{friendName}</span>
                    {room.isUnRead && (
                      <BellRing
                        className="ml-2 inline-block h-4 w-4 text-amber-500 align-middle"
                        aria-label="Unread message"
                      />
                    )}
                    {room.lastMessage && (
                      <span className="ml-2 inline-block max-w-[70%] truncate align-middle text-sm text-muted-foreground">- {room.lastMessage.content}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}