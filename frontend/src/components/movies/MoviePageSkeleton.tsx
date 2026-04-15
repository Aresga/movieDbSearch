import { Skeleton } from '@/components/ui/skeleton'

/**
 * MoviePageSkeleton Component
 * Provides a comprehensive layout-matching fallback UI constructed using generic Skeleton elements.
 * Accurately mimics the structure of the MovieHero, Cast, and Media sections to prevent 
 * Cumulative Layout Shift (CLS) during network fetching on the Movie Detail page.
 */
export function MoviePageSkeleton() {
  return (
    <div className="w-full">
      {/* Backdrop skeleton */}
      <Skeleton className="w-full h-120 mb-12 rounded-none" />

      <div className="px-6 max-w-5xl mx-auto relative">
        <div className="flex flex-col md:flex-row gap-6 -mt-110">
          {/* Poster skeleton */}
          <Skeleton className="w-full md:w-72 aspect-2/3 rounded-lg shrink-0" />

          <div className="flex-1 pt-15 space-y-3">
            {/* Title */}
            <Skeleton className="h-8 w-3/4" />
            {/* Tagline */}
            <Skeleton className="h-4 w-1/2" />
            {/* Genre badges */}
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>
            {/* Meta row (year, runtime, popularity, votes) */}
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </div>
          </div>
        </div>

        {/* Overview */}
        <Skeleton className="h-5 w-32 mt-6 mb-2" />
        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Cast skeleton */}
      <div className="mt-8 mb-10 max-w-5xl mx-auto">
        <Skeleton className="h-5 w-36 mb-3" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 w-28 rounded-lg border bg-card overflow-hidden">
              <Skeleton className="w-full aspect-2/3" />
              <div className="p-2 space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Media skeleton */}
      <div className="mt-8 max-w-5xl mx-auto">
        <Skeleton className="h-5 w-24 mb-3" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shrink-0 w-56">
              <Skeleton className="w-full aspect-video rounded-lg" />
              <div className="p-2 space-y-1">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
