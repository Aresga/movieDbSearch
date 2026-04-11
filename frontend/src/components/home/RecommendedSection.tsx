import { Sparkles } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MovieCard } from '@/components/movies/MovieCard'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecommendations } from '@/hooks/useSearch'
import { useWatchedList, useWishlist } from '@/hooks/useMovieLists'
import { useAuthStore } from '@/store/authStore'
import { useMovieListsMirrorStore } from '@/store/movieListsMirrorStore'
import type { SearchResponse } from '@/types'

type RecommendedSectionProps = {
  pageSize: number
  isSearching: boolean
}

export function RecommendedSection({ pageSize, isSearching }: RecommendedSectionProps) {
  const user = useAuthStore((s) => s.user)
  const mirroredLists = useMovieListsMirrorStore((s) =>
    user?.id ? s.byUserId[user.id] : undefined,
  )

  const wishlistResult = useWishlist()
  const watchedResult = useWatchedList()

  const wishlistCount = Array.isArray(wishlistResult.data) ? wishlistResult.data.length : 0
  const watchedCount = Array.isArray(watchedResult.data) ? watchedResult.data.length : 0
  const mirroredWishlistCount = mirroredLists?.wishlistTmdbIds.length ?? 0
  const mirroredWatchedCount = mirroredLists?.watchedTmdbIds.length ?? 0
  const hasMovieHistory =
    wishlistCount + watchedCount > 0 || mirroredWishlistCount + mirroredWatchedCount > 0

  const shouldShowRecommendations = !!user && hasMovieHistory && !isSearching
  const recommendationsResult = useRecommendations(pageSize, shouldShowRecommendations)

  const recommendationPages = (recommendationsResult.data?.pages ?? []) as SearchResponse[]
  const recommendedMovies = recommendationPages.flatMap((page) => page.results)

  if (!shouldShowRecommendations) return null

  return (
    <section className="p-6 border-b border-border/40 min-w-full">
      {recommendationsResult.isError && (
        <Alert variant="destructive" className="mb-4 max-w-xl">
          <AlertDescription>Failed to load personalized recommendations.</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4 mb-4">
        <Sparkles className="size-4 text-amber-500" />
        <p className="text-sm text-muted-foreground flex items-center gap-4">
          <strong className="text-foreground">Recommended for you</strong>
          {' '} based on your wishlist and watched history
        </p>
      </div>

      {recommendationsResult.isLoading ? (
        <div className="flex max-w-full gap-4 overflow-hidden pb-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="shrink-0 w-[160px] sm:w-[180px] md:w-[200px] rounded-lg border border-border/50"
            >
              <Skeleton className="aspect-2/3 w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : recommendedMovies.length > 0 ? (
        // <div className="max-w-full overflow-hidden">
          <ScrollArea className="w-0 min-w-full rounded-md ">
            <div className="flex gap-4 pb-4">
              {recommendedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="shrink-0 w-[160px] sm:w-[180px] md:w-[200px] overflow-hidden rounded-lg border border-border/50"
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        // </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          We are still learning your taste. Add more movies to your wishlist or watched list.
        </p>
      )}
    </section>
  )
}