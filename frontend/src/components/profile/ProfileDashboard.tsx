import { Link, useNavigate } from 'react-router-dom'
import { Calendar, MessageCircle, Settings, Shield, Star, Trash2, Users, UserPlus, UserMinus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { User, Review } from '@/types'
import { useFriends, useAddFriend, useRemoveFriend } from '@/hooks/useFriends'
import { useCreateChatRoom } from '@/hooks/useChat'

export interface ProfileDashboardProps {
  user: User
  reviews: Review[]
  friendsCount: number
  isPrivate?: boolean
  canManageReviews?: boolean
  onDeleteReview?: (movieId: number) => void
}

/**
 * AddFriendButton Component
 * Internal stateful component that manages the "Add/Remove Friend" toggle logic for the profile.
 */
function AddFriendButton({ userId }: { userId: string }) {
  const navigate = useNavigate()
  const { data: friends = [] } = useFriends()
  const { mutate: addFriend, isPending: isAdding } = useAddFriend()
  const { mutate: removeFriend, isPending: isRemoving } = useRemoveFriend()
  const { mutate: createRoom, isPending: isCreating } = useCreateChatRoom()

  const isFriend = friends.some((f) => f.id === userId)
  const isPending = isAdding || isRemoving

  if (isFriend) return (
    <div className="grid w-full grid-cols-2 gap-2">
      <Button
        size="sm"
        variant="outline"
        className="gap-1 h-8 w-full px-2 text-xs"
        onClick={() =>
          createRoom(userId, {
            onSuccess: (room) => navigate(`/rooms/${room._id}`),
          })
        }
        disabled={isRemoving || isCreating}
      >
        <MessageCircle className="size-4" />
        {isCreating ? 'Opening…' : 'Message'}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1 h-8 w-full px-2 text-xs text-destructive hover:bg-destructive hover:text-white border-destructive/40"
        onClick={() => removeFriend(userId)}
        disabled={isRemoving || isCreating}
      >
        <UserMinus className="size-4" />
        {isRemoving ? 'Removing...' : 'Remove'}
      </Button>
    </div>
  )

  return (
    <Button
      size='sm'
      variant='outline'
      className='gap-2 w-full text-primary hover:bg-primary hover:text-primary-foreground border-primary/40'
      onClick={() => addFriend(userId)}
      disabled={isPending}
    >
      <UserPlus className='size-4' />
      {isPending ? 'Sending...' : 'Add friend'}
    </Button>
  )
}

/**
 * ProfileDashboard Component
 * Renders the main dashboard for a user profile. It handles both private (self) and public
 * (other user) rendering contexts based on the isPrivate prop.
 */
export function ProfileDashboard({
  user,
  reviews,
  friendsCount,
  isPrivate = false,
  canManageReviews = false,
  onDeleteReview,
}: ProfileDashboardProps) {
  const initials = user.username.slice(0, 2).toUpperCase()

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '—'

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isPrivate ? 'My Profile' : `${user.username}'s Profile`}
        </h1>
        {isPrivate && (
          <Link to="/settings">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="size-4" />
              Settings
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

        {/* ── Left Card ── */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 flex flex-col gap-5">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative">
              <Avatar className="size-20">
                <AvatarImage src={user.avatarUrl ?? `https://i.pravatar.cc/80?u=${user.id}`} />
                <AvatarFallback className="bg-brand/20 text-brand text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {user.isOnline && (
                <span className="absolute bottom-1 right-1 size-3 rounded-full bg-green-500 ring-2 ring-background" />
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold">{user.username}</h2>
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
              )}
            </div>

            {isPrivate && (
              <Badge variant="secondary" className="text-xs px-3">
                {user.isTwoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
              </Badge>
            )}
            {!isPrivate && <AddFriendButton userId={user.id} />}
          </div>

          <div className="border-t border-border/50" />

          {/* Meta */}
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Member since</span>
              <span className="text-right">{joinedDate}</span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Status</span>
              <span className="text-right">
                {user.isOnline ? (
                  <span className="text-green-500 font-medium">Online</span>
                ) : (
                  'Offline'
                )}
              </span>
            </div>

            {/* Private-only fields */}
            {isPrivate && (
              <>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-right truncate max-w-[170px]">{user.email}</span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Security</span>
                  <span className="text-right">
                    {user.isTwoFactorEnabled ? (
                      <span className="text-green-500 font-medium">2FA active</span>
                    ) : (
                      <span className="text-muted-foreground">2FA inactive</span>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Right Side ── */}
        <div className="space-y-6">

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border/50 bg-card p-5 flex items-center gap-4">
              <Star className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-2xl font-bold">{reviews.length}</p>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-5 flex items-center gap-4">
              <Users className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-2xl font-bold">{friendsCount}</p>
                <p className="text-xs text-muted-foreground">Friends</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-5 flex items-center gap-4">
              <Shield className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-2xl font-bold">{avgRating}</p>
                <p className="text-xs text-muted-foreground">Avg Rating Given</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              Recent Activity
              {reviews.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({reviews.length} reviews)
                </span>
              )}
            </h2>

            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border/50">
                {reviews.slice(0, 5).map((r) => (
                  <div key={r.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/movie/${r.tmdb_id}`}
                        className="text-sm font-medium hover:text-brand truncate"
                      >
                        {r.title ?? `Movie #${r.tmdb_id}`}
                      </Link>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{r.rating}/5</span>
                        </div>

                        {/* Delete button — only on own profile */}
                        {canManageReviews && onDeleteReview && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-1.5 text-muted-foreground hover:text-destructive"
                            onClick={() => onDeleteReview(r.tmdb_id)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {r.comment && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {r.comment}
                      </p>
                    )}

                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      {new Date(r.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
