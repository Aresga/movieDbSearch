import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/api/client';
import { getSocket } from '@/lib/socket';
import { Check, CheckCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Message = {
  _id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
};

type Participant = {
  id: string;
  username: string;
  avatarUrl?: string | null;
};

export function ChatPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const socket = getSocket();
  const [participants, setParticipants] = useState<Participant[]>([]);

  const participantsMap = useMemo(() => {
    return new Map(participants.map((p) => [p.id, p]));
  }, [participants]);

  useEffect(() => {
    if (!roomId) return;

    const getRoomInfo = async () => {
      try {
        const res = await apiClient.get<{ participants: Participant[] }>(`/message/rooms/${roomId}/info`);
        setParticipants(res.data.participants ?? []);
      } catch (error) {
        console.error("Failed to fetch room info", error);
      }
    };

    const loadMessages = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<Message[]>(`/message/rooms/${roomId}/messages`);
        const data = res.data;
        if (Array.isArray(data)) {
          setMessages(data.reverse());
        }
        else
          setMessages([]);
        } 
      catch (error)
      {
        console.error("Failed to load messages", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchData = async () => {
      await getRoomInfo();
      await loadMessages();
      await markRoomAsRead();
    }

    fetchData();
  }, [roomId, user?.avatarUrl]);

  useEffect(() => {
    if (!roomId || !socket) return;

    const handleReceiveMessage = (msg: Message) => {
      if (msg.roomId !== roomId) return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };
    const markMessageAsRead = (data: { readBy: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId !== data.readBy ? { ...msg, read: true } : msg
        )
      );
    };
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('markAsRead', markMessageAsRead);
    socket.emit('joinRoom', roomId);

    return () => {
      socket.emit('leaveRoom', roomId);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('markAsRead', markMessageAsRead);
    };
  }, [roomId, socket]);

  const sendMessage = () => {
    if (!roomId || !socket) {
      console.error('sendMessage: Room ID or socket is missing');
      return;
    }
    const content = input.trim();
    if (!content) {
      console.error('sendMessage: content is empty');
      return;
    }

    const payload = { roomId, content };
    socket.emit('sendMessage', payload);
    setInput('');
  };

  const getSenderName = (senderId: string) => {
    if (senderId === userId) {
      return 'You';
    }
    return participantsMap.get(senderId)?.username ?? senderId;
  };

  const otherParticipant = useMemo(
    () => participants.find((p) => p.id !== userId),
    [participants, userId],
  );
  const otherInitials = (otherParticipant?.username ?? '?').slice(0, 2).toUpperCase();
  const myInitials = (user?.username ?? '?').slice(0, 2).toUpperCase();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

    const markRoomAsRead = async () => {
  if (!roomId) return;

  try {
    await apiClient.post(`/message/rooms/${roomId}/messages`);
    socket.emit('markRoomAsRead', roomId);
    setMessages((prev) =>
      prev.map((message) =>
        message.senderId !== userId ? { ...message, read: true } : message
      )
    );
  } catch (error) {
    console.error('Failed to mark room as read', error);
  }
};

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="border-b border-border/50 bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={otherParticipant?.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-brand/20 text-brand text-sm font-semibold">
              {otherInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              {otherParticipant?.username ?? 'Chat'}
            </h2>
            <p className="text-xs text-muted-foreground">Direct message</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && <p className="text-center text-muted-foreground">Loading messages...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-center text-muted-foreground">Start a conversation!</p>
        )}

        {messages.map((m) => {
          const isOwnMessage = m.senderId === userId;
          const peerAvatar = participantsMap.get(m.senderId)?.avatarUrl ?? undefined;
          return (
            <div
              key={m._id}
              className={`mb-4 flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar className="size-8 shrink-0 mt-0.5">
                <AvatarImage
                  src={
                    isOwnMessage
                      ? (user?.avatarUrl ?? undefined)
                      : peerAvatar
                  }
                />
                <AvatarFallback className="bg-brand/20 text-brand text-xs font-semibold">
                  {isOwnMessage ? myInitials : (participantsMap.get(m.senderId)?.username ?? '?').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`flex max-w-[min(100%,20rem)] flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-700/70 bg-slate-900 text-slate-100'
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">
                      {getSenderName(m.senderId)}
                    </p>
                  )}
                  <p className="break-words">{m.content}</p>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <small>{new Date(m.createdAt).toLocaleTimeString()}</small>

                  {isOwnMessage && (
                    m.read ? (
                      <CheckCheck className="h-3.5 w-3.5 text-sky-400" aria-label="Read" />
                    ) : (
                      <Check className="h-3.5 w-3.5 opacity-70" aria-label="Sent" />
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {!socket.connected && (
        <div className="border-t border-border/50 bg-card px-4 py-2 text-center text-sm text-muted-foreground">
          Connecting to chat...
        </div>
      )}
      <div className="border-t border-border/50 bg-card px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={!roomId || !socket.connected}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground transition focus:border-ring focus:outline-none disabled:opacity-50"/>
          <button
            onClick={sendMessage}
            disabled={!roomId || !input.trim() || !socket.connected}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}