import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { ReviewSection } from '@/components/ReviewSection'
import { MoviePageSkeleton } from '@/components/movies/MoviePageSkeleton'
import { MovieHero } from '@/components/movies/MovieHero'
import { MovieCast } from '@/components/movies/MovieCast'
import { MovieMedia } from '@/components/movies/MovieMedia'

export function MoviePage() {
  const { id } = useParams()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [id])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['movie', id],
    queryFn: async (): Promise<any> => {
      const res = await apiClient.get(`/movie/${id}`)
      const raw = res.data

      return {
        id: raw.id ?? raw.tmdb_id,
        tmdb_id: raw.tmdb_id,
        title: raw.title ?? raw.name,
        overview: raw.overview,
        tagline: raw.tagline,
        genres: raw.genres ?? raw.genre ?? [],
        release_date: raw.release_date ?? (raw.release_year ? `${raw.release_year}-01-01` : undefined),
        release_year: raw.release_year ?? (raw.release_date ? Number(raw.release_date.slice(0, 4)) : undefined),
        runtime: raw.runtime,
        popularity: raw.popularity,
        vote_average: raw.vote_average,
        vote_count: raw.vote_count,
        poster_path: raw.poster_path,
        backdrop_path: raw.backdrop_path,
      }
    },
    enabled: !!id,
  })

  const { data: extras } = useQuery({
    queryKey: ['movieExtras', id],
    queryFn: async () => {
      const res = await apiClient.get(`/movie/${id}/full`)
      console.log('[extras raw]', res.data)
      return res.data
    },
    enabled: !!id,
  })

  const cast = extras?.credits?.cast?.slice(0, 12) ?? []

  if (!id) return <div className="p-6">Missing movie id</div>

  if (isLoading) return <MoviePageSkeleton />

  if (isError || !data) {
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