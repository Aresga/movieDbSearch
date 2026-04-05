import { Star } from 'lucide-react'
import type { Movie } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { MovieActions } from './MovieActions'

interface MovieCardProps {
  movie: Movie
}

function getPosterUrl(movie: Movie): string {
  if (!movie.poster_path) {
    return `https://picsum.photos/seed/movie-${movie.id}/300/450`
  }
  if (movie.poster_path.startsWith('http')) return movie.poster_path
  return `https://image.tmdb.org/t/p/w500${movie.poster_path}`
}

function getYear(movie: Movie): string {
  const date = movie.release_date ?? movie.first_air_date ?? ''
  return date ? date.slice(0, 4) : ''
}

function getTitle(movie: Movie): string {
  return movie.title ?? movie.name ?? 'Untitled'
}

export function MovieCard({ movie }: MovieCardProps) {
  const title = getTitle(movie)
  const year = getYear(movie)
  const rating = movie.vote_average


  return (
    <div className="group relative rounded-lg overflow-hidden bg-card border border-border/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/60 hover:border-brand/40">
      <Link to={`/movie/${movie.id}`} className="block">
        {/* Poster */}
        <div className="aspect-[2/3] overflow-hidden bg-muted">
          <img
            src={getPosterUrl(movie)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          {movie.overview && (
            <p className="text-white/80 text-xs line-clamp-4 mb-2">{movie.overview}</p>
          )}
        </div>

        {/* Bottom info — always visible */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8 pointer-events-none">
          <p className="text-white text-sm font-semibold line-clamp-2 leading-tight">{title}</p>
          <div className="flex items-center justify-between mt-1.5">
            {year && <span className="text-white/60 text-xs">{year}</span>}
            {rating !== undefined && rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="size-3 text-yellow-400 fill-yellow-400" />
                <span className="text-white/80 text-xs font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Quick Action Buttons */}
      <MovieActions movieId={movie.id} variant="icon" />

      {/* Media type badge */}
      {movie.media_type && movie.media_type !== 'movie' && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 uppercase tracking-wide">
            {movie.media_type}
          </Badge>
        </div>
      )}
    </div>
  )
}
