import { useState } from 'react'
import { useReviews, usePostReview, useDeleteReview, useEditReview } from '@/hooks/useReviews'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Pencil, Trash2, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import { EmotionBadge } from '@/components/ui/EmotionBadge'
import type { Review } from '@/types'

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110 disabled:pointer-events-none"
          disabled={!onChange}
        >
          <Star
            className={`size-5 transition-colors ${
              star <= active
                ? 'fill-brand text-brand'
                : 'fill-muted text-muted-foreground'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-muted-foreground self-center">
          {value}/5
        </span>
      )}
    </div>
  )
}

function ReviewComposeInner({
  movieId,
  myReview,
  isEditMode,
  onCancelEdit,
}: {
  movieId: string
  myReview?: Review
  isEditMode: boolean
  onCancelEdit: () => void
}) {
  const { mutate: post, isPending: isPosting } = usePostReview(movieId)
  const { mutate: edit, isPending: isEditing } = useEditReview(movieId)

  const [rating, setRating] = useState(() => myReview?.rating ?? 0)
  const [comment, setComment] = useState(() => myReview?.comment ?? '')

  const handleSubmit = () => {
    if (!rating || !comment.trim()) return
    if (isEditMode && myReview) {
      edit({ rating, comment }, { onSuccess: onCancelEdit })
    } else {
      post({ rating, comment })
    }
  }

  return (
    <div className="mb-8 p-5 rounded-xl border border-border bg-card space-y-4">
      <p className="text-sm font-semibold">
        {isEditMode ? 'Edit your review' : 'Write a review'}
      </p>
      <StarRating value={rating} onChange={setRating} />
      <Textarea
        placeholder="What did you think of this movie?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="resize-none bg-background"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!rating || !comment.trim() || isPosting || isEditing}
          className="bg-brand hover:bg-brand/90 text-white"
        >
          {!rating
            ? 'Select a rating first'
            : isPosting || isEditing
              ? 'Saving...'
              : isEditMode
                ? 'Save changes'
                : 'Submit review'}
        </Button>
        {isEditMode && (
          <Button size="sm" variant="ghost" onClick={onCancelEdit}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}

export function ReviewSection({ movieId }: { movieId: string }) {
  const user = useAuthStore((s) => s.user)
  const { data: reviews = [], isLoading, isError } = useReviews(movieId)
  const { mutate: remove } = useDeleteReview(movieId)

  const myReview = reviews.find((r) => r.userId === user?.id)

  const [isEditMode, setIsEditMode] = useState(false)

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (isError) return (
    <section className="mt-10 max-w-5xl mx-auto px-6">
      <p className="text-sm text-muted-foreground">Failed to load reviews.</p>
    </section>
  )

  return (
    <section className="mt-10 mb-16 max-w-5xl mx-auto px-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Reviews</h2>
          {reviews.length > 0 && (
            <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {reviews.length}
            </span>
          )}
        </div>
        {averageRating && (
          <div className="flex items-center gap-1.5">
            <Star className="size-4 fill-brand text-brand" />
            <span className="text-sm font-semibold">{averageRating}</span>
            <span className="text-xs text-muted-foreground">/ 5</span>
          </div>
        )}
      </div>

      {user && (!myReview || isEditMode) && (
        <ReviewComposeInner
          key={`${myReview?.id ?? 'new'}-${isEditMode}`}
          movieId={movieId}
          myReview={myReview}
          isEditMode={isEditMode}
          onCancelEdit={() => setIsEditMode(false)}
        />
      )}

      {/* Review list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-border">
          <Star className="size-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">No reviews yet</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to share your thoughts</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const initials = r.user?.username?.slice(0, 2).toUpperCase() ?? '??'
            const isOwn = user?.id === r.userId
            return (
              <div
              key={r.id}
              className={`p-5 rounded-xl border bg-card transition-colors ${
                isOwn ? 'border-brand/30' : 'border-border'
              }`}
              
              >

                <div className="flex items-start gap-3">
                  <Avatar className="size-9 shrink-0">
                    <AvatarImage src={r.user.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-brand/20 text-brand text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={isOwn ? `/user/me` : `/user/${r.userId}`}
                          className="text-sm font-semibold hover:text-brand transition-colors"
                        >
                          {r.user?.username ?? 'Unknown'}
                        </Link>
                        {r.sentiment && (
                          <EmotionBadge
                            sentiment={r.sentiment}
                            score={r.sentimentScore}
                            className="ml-2"
                          />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <StarRating value={r.rating} />
                    <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{r.comment}</p>
                    {isOwn && (
                      <div className="flex gap-1 mt-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => setIsEditMode(true)}
                        >
                          <Pencil className="size-3 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => remove(Number(movieId))}
                        >
                          <Trash2 className="size-3 mr-1" /> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
