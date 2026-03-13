import { Film } from 'lucide-react'
import type { Movie } from '@/types'
import { MovieCard } from './MovieCard'
import { Skeleton } from '@/components/ui/skeleton'

interface MovieGridProps {
  movies: Movie[]
  isLoading?: boolean
  query?: string
}

function MovieSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-border/50">
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  )
}

export function MovieGrid({ movies, isLoading, query }: MovieGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <MovieSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (movies.length === 0 && query) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <Film className="size-16 text-muted-foreground/40" />
        <p className="text-muted-foreground">No results found for <strong className="text-foreground">"{query}"</strong></p>
        <p className="text-sm text-muted-foreground/60">Try a different title or sentence</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}
