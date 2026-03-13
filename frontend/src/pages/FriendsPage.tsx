import { Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FriendCard } from '@/components/friends/FriendCard'
import { AddFriendDialog } from '@/components/friends/AddFriendDialog'
import { useFriends } from '@/hooks/useFriends'

function FriendsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function FriendsPage() {
  const { data: friends, isLoading, isError } = useFriends()

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Friends</h1>
          {friends && (
            <p className="text-sm text-muted-foreground">
              {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
            </p>
          )}
        </div>
        <AddFriendDialog />
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>Failed to load friends. Is the API running?</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <FriendsSkeleton />
      ) : friends && friends.length > 0 ? (
        <div className="flex flex-col gap-2">
          {friends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
            
          ))}
        </div>
      ) : !isError ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="bg-muted rounded-full p-4">
            <Users className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">No friends yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add friends by their user ID to see them here
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
