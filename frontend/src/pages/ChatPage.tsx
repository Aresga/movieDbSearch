import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket';
import { useChatRoomInfo, useChatRoomMessages, useMarkRoomAsRead } from '@/hooks/useChat';
import type { ChatMessage } from '@/api/chat';
import type { User } from '@/types';
import { Check, CheckCheck, Smile, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EMOJI_GROUPS, type EmojiGroupKey, getRecentEmojis, saveRecentEmoji } from '@/lib/emojis';

export function ChatPage() {
  const TEXTAREA_MAX_HEIGHT = 128;
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiGroup, setActiveEmojiGroup] = useState<EmojiGroupKey | 'recent'>('recent');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);

  useEffect(() => {
    setRecentEmojis(getRecentEmojis());
  }, [showEmojiPicker]);
  const socket = getSocket();
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const { data: roomInfo } = useChatRoomInfo(roomId ?? '');
  const { data: roomMessages = [], isLoading: isMessagesLoading } = useChatRoomMessages(roomId ?? '');
  const { mutate: markRoomAsRead } = useMarkRoomAsRead();
  const participants = (roomInfo?.participants ?? []) as User[];

  const participantsMap = useMemo(() => {
    return new Map(participants.map((p) => [p.id, p]));
  }, [participants]);

  useEffect(() => {
    if (!roomMessages) {
      setMessages([]);
      return;
    }
    const ordered = [...roomMessages].reverse();
    setMessages(ordered);
  }, [roomMessages]);

  useEffect(() => {
    if (!roomId || !socket) return;

    const ensureConnected = () => {
      if (!socket.connected) {
        socket.connect();
      }
    };

    const handleConnect = () => {
      setIsSocketConnected(true);
      socket.emit('joinRoom', roomId);
    };

    const handleDisconnect = () => {
      setIsSocketConnected(false);
    };

    const handleReceiveMessage = (msg: ChatMessage) => {
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

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('markAsRead', markMessageAsRead);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        ensureConnected();
      }
    };

    const handleOnline = () => {
      ensureConnected();
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('online', handleOnline);

    ensureConnected();
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.emit('leaveRoom', roomId);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('markAsRead', markMessageAsRead);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('online', handleOnline);
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!inputRef.current) return;

    inputRef.current.style.height = 'auto';
    const nextHeight = Math.min(inputRef.current.scrollHeight, TEXTAREA_MAX_HEIGHT);
    inputRef.current.style.height = `${nextHeight}px`;
    inputRef.current.style.overflowY = inputRef.current.scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
  }, [TEXTAREA_MAX_HEIGHT, input]);

  useEffect(() => {
    if (!roomId) return;

    markRoomAsRead(roomId, {
      onSuccess: () => {
        socket.emit('markRoomAsRead', roomId);
        setMessages((prev) =>
          prev.map((message) =>
            message.senderId !== userId ? { ...message, read: true } : message
          )
        );
      },
    });
  }, [markRoomAsRead, roomId, socket, userId]);

  const addEmoji = (emoji: string) => {
    const textarea = inputRef.current;
    saveRecentEmoji(emoji);

    if (!textarea) {
      setInput((prev) => `${prev}${emoji}`.slice(0, 1000));
      return;
    }

    const start = textarea.selectionStart ?? input.length;
    const end = textarea.selectionEnd ?? input.length;
    const nextValue = `${input.slice(0, start)}${emoji}${input.slice(end)}`.slice(0, 1000);

    setInput(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = Math.min(start + emoji.length, nextValue.length);
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const displayEmojis = activeEmojiGroup === 'recent' 
    ? recentEmojis 
    : EMOJI_GROUPS.find((group) => group.key === activeEmojiGroup)?.emojis ?? [];

  const hasRecentEmojis = recentEmojis.length > 0;

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="border-b border-border/50 bg-card px-4 py-3">
        <h2 className="text-lg font-semibold text-card-foreground">Chat with {roomInfo?.participants.find((p) => p.id !== userId)?.username ?? 'Unknown User'}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isMessagesLoading && <p className="text-center text-muted-foreground">Loading messages...</p>}
        {!isMessagesLoading && messages.length === 0 && (
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
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {!isSocketConnected && (
        <div className="border-t border-border/50 bg-card px-4 py-2 text-center text-sm text-muted-foreground">
          Connecting to chat...
        </div>
      )}
      <div className=" bg-card px-2 py-3">
        <div className="relative flex items-end gap-2">
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                disabled={!roomId || !isSocketConnected}
                aria-label="Open emoji picker"
                title="Add emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="top" className="w-[320px] p-2">
              <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
                {hasRecentEmojis && (
                  <Button
                    type="button"
                    variant={activeEmojiGroup === 'recent' ? 'default' : 'ghost'}
                    size="xs"
                    onClick={() => setActiveEmojiGroup('recent')}
                    className="flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    Recent
                  </Button>
                )}
                {EMOJI_GROUPS.map((group) => (
                  <Button
                    key={group.key}
                    type="button"
                    variant={activeEmojiGroup === group.key ? 'default' : 'ghost'}
                    size="xs"
                    onClick={() => setActiveEmojiGroup(group.key)}
                  >
                    {group.label}
                  </Button>
                ))}
              </div>

              {displayEmojis.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {activeEmojiGroup === 'recent' ? 'No recent emojis' : 'No emojis'}
                </div>
              ) : (
                <div className="grid max-h-52 grid-cols-8 gap-1 overflow-y-auto pr-1">
                  {displayEmojis.map((emoji) => (
                    <Button
                      key={`emoji-${emoji}`}
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-base"
                      onClick={() => addEmoji(emoji)}
                      aria-label={`Insert ${emoji}`}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              )}
            </PopoverContent>
          </Popover>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={!roomId || !isSocketConnected}
            placeholder="Type a message..."
            rows={1}
            maxLength={1000}
            className="h-10 max-h-32 min-h-10 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground transition focus:border-ring focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!roomId || !input.trim() || !isSocketConnected}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}