import { Badge } from '@/components/ui/badge'
import { MovieActions } from './MovieActions'

export interface MovieHeroData {
  id: number
  title: string
  overview: string
  tagline?: string
  genres: string[]
  release_year?: number
  runtime?: number
  popularity?: number
  vote_count?: number
  poster_path?: string
  backdrop_path?: string
}

export interface MovieHeroProps {
  data: MovieHeroData
}

/**
 * Formats a raw minute value into a human-readable xH yM format.
 */
const formatRuntime = (min?: number) => {
  if (!min && min !== 0) return null
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

/**
 * MovieHero Component
 * The visual centerpiece of the Movie details page, rendering the large background
 * backdrop, the main poster, title, tagline, and overview.
 */
export function MovieHero({ data }: MovieHeroProps) {
  const poster = data.poster_path
    ? data.poster_path.startsWith('http')
      ? data.poster_path
      : `https://image.tmdb.org/t/p/original${data.poster_path}`
    : `https://picsum.photos/seed/movie-${data.id}/500/750`

  const backdrop = data.backdrop_path
    ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
    : null
  const overlayTextClass = backdrop ? 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]' : 'text-foreground'
  const overlayMutedTextClass = backdrop ? 'text-white/85 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]' : 'text-muted-foreground'

  return (
    <>
      {/* Backdrop Section */}
      {backdrop && (
        <div className="relative w-full h-120 mb-12">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${backdrop})` }}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Content Section */}
      <div className="px-6 max-w-5xl mx-auto relative">
        <div className={`flex flex-col ${backdrop ? 'md:flex-row' : 'md:flex-row'} gap-6 ${backdrop ? '-mt-110' : ''}`}>
          <img
            src={poster}
            alt={data.title}
            className={`w-full md:w-72 rounded-lg shadow-2xl shrink-0 ${backdrop ? 'md:mb-8' : ''}`}
          />

          <div className="flex-1 pt-15">
            <div className="flex justify-between items-start mb-2">
              <h1 className={`text-3xl font-bold ${overlayTextClass}`}>{data.title}</h1>
            </div>

            {data.tagline && <p className={`text-sm italic mb-3 ${overlayMutedTextClass}`}>{data.tagline}</p>}

            <div className="flex flex-wrap gap-2 mb-4">
              {(data.genres || []).map((g: string, i: number) => (
                <Badge key={i} variant="secondary">{g}</Badge>
              ))}
            </div>

            <div className={`flex items-center gap-4 text-sm mb-4 ${overlayMutedTextClass}`}>
              {data.release_year && <span>{data.release_year}</span>}
              {data.runtime && <span>{formatRuntime(data.runtime)}</span>}
              {data.popularity !== undefined && <span>Popularity: {Math.round(data.popularity)}</span>}
              {data.vote_count !== undefined && <span>{data.vote_count.toLocaleString()} votes</span>}
            </div>
            <MovieActions movieId={data.id} />
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-2">Overview</h2>
        <p className="text-foreground italic mb-6">{data.overview}</p>
      </div>
    </>
  )
}
