import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ProfileDashboard } from '@/components/profile/ProfileDashboard'
import { useFriends } from '@/hooks/useFriends'
import { useDeleteReview, useUserReviews } from '@/hooks/useReviews'
import { useMe } from '@/hooks/useUser'

export function MyProfilePage() {
  const { data: me, isLoading, isError } = useMe()
  const { data: friends = [] } = useFriends()
  const { data: reviews = [] } = useUserReviews(me?.id ?? '')
  const { mutate: removeReview } = useDeleteReview(me?.id ?? '')

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError || !me) {
    return (
      <div className="p-6 max-w-md">
        <Alert variant="destructive">
          <AlertDescription>Failed to load your profile.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <ProfileDashboard
      user={me}
      reviews={reviews}
      friendsCount={friends.length}
      isPrivate={true}
      canManageReviews={true}
      onDeleteReview={removeReview}
    />
  )
}
