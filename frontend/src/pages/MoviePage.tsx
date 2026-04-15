import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { ReviewSection } from '@/components/ReviewSection'
import { MoviePageSkeleton } from '@/components/movies/MoviePageSkeleton'
import { MovieHero } from '@/components/movies/MovieHero'
import { MovieCast } from '@/components/movies/MovieCast'
import { MovieMedia } from '@/components/movies/MovieMedia'

type MovieDetail = {
  id: number
  tmdb_id?: number
  title: string
  overview: string
  tagline?: string
  genres: string[]
  release_date?: string
  release_year?: number
  runtime?: number
  popularity?: number
  vote_average?: number
  vote_count?: number
  poster_path?: string
  backdrop_path?: string
}

type MovieExtrasPayload = {
  credits?: {
    cast?: Array<{
      id: number
      name: string
      character?: string
      profile_path?: string
    }>
  }
  videos?: {
    results?: Array<{
      id: string
      key: string
      name: string
      site: string
      type: string
    }>
  }
}

function normalizeGenres(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.map((g) => {
    if (typeof g === 'string') return g
    if (g && typeof g === 'object' && 'name' in g && typeof (g as { name: unknown }).name === 'string') {
      return (g as { name: string }).name
    }
    return ''
  }).filter(Boolean)
}

export function MoviePage() {
  const { id } = useParams()
  const [heroAssetsReady, setHeroAssetsReady] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [id])

  useEffect(() => {
    setHeroAssetsReady(false)
  }, [id])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['movie', id],
    queryFn: async (): Promise<MovieDetail> => {
      const res = await apiClient.get<Record<string, unknown>>(`/movie/${id}`)
      const raw = res.data
      const releaseDate = raw.release_date
      const releaseYearRaw = raw.release_year

      return {
        id: Number(raw.tmdb_id ?? raw.id),
        tmdb_id: typeof raw.tmdb_id === 'number' ? raw.tmdb_id : undefined,
        title: String(raw.title ?? raw.name ?? ''),
        overview: String(raw.overview ?? ''),
        tagline: typeof raw.tagline === 'string' ? raw.tagline : undefined,
        genres: normalizeGenres(raw.genres ?? raw.genre),
        release_date:
          typeof releaseDate === 'string'
            ? releaseDate
            : typeof releaseYearRaw === 'number'
              ? `${releaseYearRaw}-01-01`
              : undefined,
        release_year:
          typeof releaseYearRaw === 'number'
            ? releaseYearRaw
            : typeof releaseDate === 'string'
              ? Number(releaseDate.slice(0, 4)) || undefined
              : undefined,
        runtime: typeof raw.runtime === 'number' ? raw.runtime : undefined,
        popularity: typeof raw.popularity === 'number' ? raw.popularity : undefined,
        vote_average: typeof raw.vote_average === 'number' ? raw.vote_average : undefined,
        vote_count: typeof raw.vote_count === 'number' ? raw.vote_count : undefined,
        poster_path: typeof raw.poster_path === 'string' ? raw.poster_path : undefined,
        backdrop_path: typeof raw.backdrop_path === 'string' ? raw.backdrop_path : undefined,
      }
    },
    enabled: !!id,
  })

  const { data: extras, isLoading: isExtrasLoading, isError: isExtrasError } = useQuery({
    queryKey: ['movieExtras', id],
    queryFn: async (): Promise<MovieExtrasPayload> => {
      const res = await apiClient.get<MovieExtrasPayload>(`/movie/${id}/full`)
      return res.data
    },
    enabled: !!id,
  })

  const cast = extras?.credits?.cast?.slice(0, 12) ?? []

  useEffect(() => {
    if (!data) return

    const poster = data.poster_path
      ? data.poster_path.startsWith('http')
        ? data.poster_path
        : `https://image.tmdb.org/t/p/original${data.poster_path}`
      : `https://picsum.photos/seed/movie-${data.id}/500/750`

    const backdrop = data.backdrop_path
      ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
      : null

    const sources = [poster, backdrop].filter(Boolean) as string[]

    if (sources.length === 0) {
      setHeroAssetsReady(true)
      return
    }

    let isActive = true
    let remaining = sources.length

    const markDone = () => {
      remaining -= 1
      if (isActive && remaining <= 0) {
        setHeroAssetsReady(true)
      }
    }

    sources.forEach((source) => {
      const image = new Image()
      image.onload = markDone
      image.onerror = markDone
      image.src = source
    })

    return () => {
      isActive = false
    }
  }, [data])

  const isPageLoading = isLoading || isExtrasLoading || !heroAssetsReady

  if (!id) return <div className="p-6">Missing movie id</div>

  if (isPageLoading) return <MoviePageSkeleton />

  if (isError || isExtrasError || !data || !extras) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-center text-muted-foreground">Failed to load movie.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <MovieHero data={data} />
      <MovieCast cast={cast} />
      <MovieMedia videos={extras?.videos?.results ?? []} />
      <ReviewSection movieId={id!} />
    </div>
  )
}