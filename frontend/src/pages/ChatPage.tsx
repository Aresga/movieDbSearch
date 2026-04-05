import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/api/client';
import { getSocket } from '@/lib/socket';

type Message = {
  _id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

type Participant = {
  id: string;
  username: string;
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
    console.log(participantsMap);
  }, [participantsMap]);

  useEffect(() => {
    if (!roomId) return;

    const getRoomInfo = async () => {
      try {
        const res = await apiClient.get(`/message/rooms/${roomId}/info`);
        setParticipants(res.data.participants);
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
    }

    fetchData();
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !socket) return;

    const handleReceiveMessage = (msg: Message) => {
      if (msg.roomId !== roomId) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };
    socket.on('receiveMessage', handleReceiveMessage);
    socket.emit('joinRoom', roomId);
    return () => {
      socket.emit('leaveRoom', roomId);
      socket.off('receiveMessage', handleReceiveMessage);
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="border-b border-border/50 bg-card px-4 py-3">
        <h2 className="text-lg font-semibold text-card-foreground">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && <p className="text-center text-muted-foreground">Loading messages...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-center text-muted-foreground">Start a conversation!</p>
        )}

        {messages.map((m) => {
          const isOwnMessage = m.senderId === userId;
          return (
            <div
              key={m._id}
              className={`mb-4 flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 ${
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
              <small className="mt-1 text-xs text-muted-foreground">
                {new Date(m.createdAt).toLocaleTimeString()}
              </small>
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