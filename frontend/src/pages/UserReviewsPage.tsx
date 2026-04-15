import { Link, useParams } from 'react-router-dom'
import { Calendar, Star, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeleteReview, useUserReviews } from '@/hooks/useReviews'
import { useMe, useUserById } from '@/hooks/useUser'

function ReviewsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card p-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-3 h-3 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function UserReviewsPage() {
  const { id: routeId = '' } = useParams<{ id: string }>()
  const { data: me, isLoading: isMeLoading, isError: isMeError } = useMe()

  const isMeRoute = routeId === 'me'
  const targetUserId = isMeRoute ? (me?.id ?? '') : routeId

  const {
    data: routeUser,
    isLoading: isRouteUserLoading,
    isError: isRouteUserError,
  } = useUserById(isMeRoute ? '' : routeId)

  const { data: reviews = [], isLoading: isReviewsLoading, isError: isReviewsError } = useUserReviews(targetUserId)
  const { mutate: removeReview, isPending: isDeleting } = useDeleteReview(targetUserId)

  const user = isMeRoute ? me : routeUser
  const isOwnProfile = !!me?.id && me.id === targetUserId

  const isLoading = isMeLoading || isRouteUserLoading || isReviewsLoading
  const isError = (isMeRoute && isMeError) || (!isMeRoute && isRouteUserError) || isReviewsError

  if (!routeId) return null

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <ReviewsSkeleton />
      </div>
    )
  }

  if (isError || !user || !targetUserId) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Failed to load reviews for this user.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const backToProfilePath = isOwnProfile ? '/user/me' : `/user/${targetUserId}`

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{isOwnProfile ? 'My Reviews' : `${user.username}'s Reviews`}</h1>
          <p className="text-sm text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to={backToProfilePath}>Back to profile</Link>
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-card p-2">
          <div className="flex flex-col divide-y divide-border/50">
            {reviews.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/movie/${r.tmdb_id}`} className="text-sm font-medium hover:text-brand truncate">
                    {r.title ?? `Movie #${r.tmdb_id}`}
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{r.rating}/5</span>
                    </div>

                    {isOwnProfile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-1.5 text-muted-foreground hover:text-destructive"
                        onClick={() => removeReview(r.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {r.comment && (
                  <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>
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
        </div>
      )}
    </div>
  )
}
