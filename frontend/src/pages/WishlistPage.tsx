import { Heart } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MovieGrid } from '@/components/movies/MovieGrid'
import { useWishlist } from '@/hooks/useMovieLists'
import type { Movie } from '@/types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function toMovie(value: unknown): Movie | null {
  if (!isRecord(value)) return null
  const source = isRecord(value.movie) ? value.movie : value
  const id = source.tmdb_id ?? source.tmdbId ?? source.id
  if (typeof id !== 'number' && typeof id !== 'string') return null

  const releaseYear = source.release_year
  return {
    id,
    title: typeof source.title === 'string' ? source.title : undefined,
    name: typeof source.name === 'string' ? source.name : undefined,
    overview: typeof source.overview === 'string' ? source.overview : undefined,
    poster_path: typeof source.poster_path === 'string' ? source.poster_path : undefined,
    backdrop_path: typeof source.backdrop_path === 'string' ? source.backdrop_path : undefined,
    release_date:
      typeof source.release_date === 'string'
        ? source.release_date
        : typeof releaseYear === 'number'
          ? `${releaseYear}-01-01`
          : undefined,
    first_air_date: typeof source.first_air_date === 'string' ? source.first_air_date : undefined,
    vote_average: typeof source.vote_average === 'number' ? source.vote_average : undefined,
    vote_count: typeof source.vote_count === 'number' ? source.vote_count : undefined,
    media_type:
      source.media_type === 'movie' || source.media_type === 'tv' || source.media_type === 'person'
        ? source.media_type
        : undefined,
  }
}

export function WishlistPage() {
  const { data, isLoading, isError } = useWishlist()
  const movies = (data ?? []).map(toMovie).filter((m): m is Movie => m != null)

  return (
    <div className="flex min-h-full flex-col p-6">
      <div className="mb-4 flex items-center gap-2">
        <Heart className="size-4 text-red-400" />
        <h1 className="text-xl font-bold tracking-tight">Wish List</h1>
        <span className="text-sm text-muted-foreground">({movies.length})</span>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4 max-w-xl">
          <AlertDescription>Failed to load your wish list.</AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && movies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          List is empty. Add items to view them here.
        </div>
      ) : (
        <MovieGrid movies={movies} isLoading={isLoading} />
      )}
    </div>
  )
}
