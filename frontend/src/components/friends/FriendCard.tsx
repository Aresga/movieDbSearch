import { UserMinus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Friend } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useRemoveFriend } from '@/hooks/useFriends'

interface FriendCardProps {
  friend: Friend
}

/**
 * FriendCard Component
 * Displays a single friend connection in a list layout, showcasing their avatar, 
 * identity, online indicator status via websocket, and allowing the user to sever the connection.
 */
export function FriendCard({ friend }: FriendCardProps) {
  const { mutate: remove, isPending } = useRemoveFriend()
  const initials = friend.username.slice(0, 2).toUpperCase()
  const isOnline = friend.isOnline

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card hover:border-border transition-colors">
      <Link to={`/user/${friend.id}`} className="shrink-0 relative">
        <Avatar className="size-10">
          <AvatarImage src={friend.avatar_url ?? `https://i.pravatar.cc/40?u=${friend.id}`} />
          <AvatarFallback className="bg-brand/20 text-brand text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {isOnline && (
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 ring-2 ring-background" />
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          to={`/user/${friend.id}`}
          className="text-sm font-semibold hover:text-brand transition-colors"
        >
          {friend.username}
        </Link>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => remove(friend.id)}
        disabled={isPending}
        title="Remove friend"
      >
        <UserMinus className="size-4" />
      </Button>
    </div>
  )
}
