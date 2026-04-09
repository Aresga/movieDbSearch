import { useEffect, useState } from 'react';
import { Clock, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EMOJI_GROUPS, type EmojiGroupKey, getRecentEmojis, saveRecentEmoji } from '@/lib/emojis';

type ChatEmojiPickerProps = {
  disabled: boolean;
  onEmojiSelect: (emoji: string) => void;
};

export function ChatEmojiPicker({ disabled, onEmojiSelect }: ChatEmojiPickerProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiGroup, setActiveEmojiGroup] = useState<EmojiGroupKey | 'recent'>('recent');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);

  useEffect(() => {
    if (!showEmojiPicker) return;
    setRecentEmojis(getRecentEmojis());
  }, [showEmojiPicker]);

  const displayEmojis = activeEmojiGroup === 'recent'
    ? recentEmojis
    : EMOJI_GROUPS.find((group) => group.key === activeEmojiGroup)?.emojis ?? [];

  const hasRecentEmojis = recentEmojis.length > 0;

  const handleSelect = (emoji: string) => {
    saveRecentEmoji(emoji);
    onEmojiSelect(emoji);
    setRecentEmojis(getRecentEmojis());
  };

  return (
    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          disabled={disabled}
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
                onClick={() => handleSelect(emoji)}
                aria-label={`Insert ${emoji}`}
              >
                {emoji}
              </Button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
