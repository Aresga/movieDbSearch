import { useParams } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ProfileDashboard } from '@/components/profile/ProfileDashboard'
import { useUserReviews } from '@/hooks/useReviews'
import { useUserById } from '@/hooks/useUser'
import { useFriendsCount } from '@/hooks/useFriends'

export function UserPage() {
  const { id } = useParams<{ id: string }>()

  const { data: user, isLoading, isError } = useUserById(id ?? '')
  const { data: friendsCount } = useFriendsCount(id ?? '')
  const { data: reviews = [] } = useUserReviews(id ?? '')

  if (!id) return null

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="p-6 max-w-md">
        <Alert variant="destructive">
          <AlertDescription>User not found or failed to load.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <ProfileDashboard
      user={user}
      reviews={reviews}
      friendsCount={friendsCount ?? 0}
      isPrivate={false}
      canManageReviews={false}
    />
  )
}
