/**
 * Emoji picker configuration and utilities
 * Defines emoji categories and provides recent emoji tracking via localStorage
 */

export const EMOJI_GROUPS = [
  {
    key: 'smileys',
    label: 'Smileys',
    emojis: ['😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😎', '🤔', '😴', '🥳', '😭', '😡', '🤯', '🙌', '👏'],
  },
  {
    key: 'gestures',
    label: 'Gestures',
    emojis: ['👍', '👎', '👋', '🤝', '🙏', '👌', '✌️', '🤟', '💪', '🫶', '☝️', '👇', '👉', '👈', '🤞', '🫡'],
  },
  {
    key: 'hearts',
    label: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '💖', '💘', '💯', '✨'],
  },
  {
    key: 'objects',
    label: 'Objects',
    emojis: ['🎬', '🎥', '🍿', '📺', '🎧', '🎮', '📱', '💡', '🔥', '⭐', '🌙', '☀️', '🎉', '🎁', '🚀', '🎵'],
  },
] as const;

export type EmojiGroupKey = (typeof EMOJI_GROUPS)[number]['key'];

const RECENT_EMOJIS_KEY = 'chat-recent-emojis';
const MAX_RECENT_EMOJIS = 16;

/**
 * Get recently used emojis from localStorage
 */
export function getRecentEmojis(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_EMOJIS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save an emoji to the recent emojis list
 * Moves duplicate emojis to the front and keeps list within max size
 */
export function saveRecentEmoji(emoji: string): void {
  if (typeof window === 'undefined') return;
  try {
    let recent = getRecentEmojis();

    // Remove duplicate if it exists
    recent = recent.filter((e) => e !== emoji);

    // Add to front and trim to max size
    recent.unshift(emoji);
    recent = recent.slice(0, MAX_RECENT_EMOJIS);

    localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(recent));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Clear all recent emojis
 */
export function clearRecentEmojis(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_EMOJIS_KEY);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}
