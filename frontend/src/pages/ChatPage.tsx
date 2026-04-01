import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/api/client';
import { getSocket } from '@/lib/socket';
import { userApi } from '@/api/user';

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
  const { token, user } = useAuthStore();
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

  return (
    <div className="chat">
      {loading && <p>Loading messages...</p>}
      {!loading && messages.length === 0 && <p>Start a conversation!</p>}

      {messages.map((m) => (
        <div key={m._id}>
          <p>{getSenderName(m.senderId)}</p>
          <p>{m.content}</p>
          <small>{new Date(m.createdAt).toLocaleString()}</small>
        </div>
      ))}

      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}/>
      {/* Disable button if socket is not connected */}
      <button
        onClick={sendMessage}
        disabled={!roomId || !input.trim() || !socket.connected}
      >
        Send
      </button>
      {!socket.connected && <p>Connecting to chat...</p>}
    </div>
  );
}