import type { Movie, SearchResponse } from '@/types'
import { apiClient } from './client'

type RawMovie = Record<string, unknown>

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v)
}

export const searchApi = {
  search: async (q: string, limit = 10): Promise<SearchResponse> => {
    const res = await apiClient.get<unknown>('/search', {
      params: { q, limit },
    })

    const payload = res.data

    if (Array.isArray(payload)) {
      return { results: payload, total_results: payload.length }
    }

    if (payload == null) {
      return { results: [], total_results: 0 }
    }

    if (!isRecord(payload)) {
      return { results: [], total_results: 0 }
    }

    const mapMovie = (m: RawMovie): Movie => {
      const movieId = (m.tmdb_id ?? m.tmdbId ?? m.id) as Movie['id']
      const releaseYear = m.release_year
      return {
        id: movieId,
        title: (m.title ?? m.name) as string | undefined,
        name: (m.name ?? m.title) as string | undefined,
        overview: m.overview as string | undefined,
        poster_path: m.poster_path as string | undefined,
        backdrop_path: m.backdrop_path as string | undefined,
        release_date:
          (m.release_date as string | undefined) ??
          (typeof releaseYear === 'number' ? `${releaseYear}-01-01` : undefined),
        first_air_date: m.first_air_date as string | undefined,
        vote_average: m.vote_average as number | undefined,
        vote_count: m.vote_count as number | undefined,
        genre_ids: Array.isArray(m.genre_ids) ? (m.genre_ids as number[]) : undefined,
        media_type: m.media_type as Movie['media_type'],
      }
    }

    if (Array.isArray(payload.results)) {
      return payload as unknown as SearchResponse
    }

    if (Array.isArray(payload.data)) {
      const rows = payload.data as RawMovie[]
      return { results: rows.map(mapMovie), total_results: rows.length }
    }

    const data = payload.data
    if (isRecord(data) && Array.isArray(data.results)) {
      return {
        ...(data as unknown as SearchResponse),
        results: (data.results as RawMovie[]).map(mapMovie),
      }
    }

    if (Array.isArray(payload.items)) {
      const rows = payload.items as RawMovie[]
      return { results: rows.map(mapMovie), total_results: rows.length }
    }

    if (Array.isArray(payload.movies)) {
      const rows = payload.movies as RawMovie[]
      return { results: rows.map(mapMovie), total_results: rows.length }
    }

    return {
      results: Array.isArray(payload.results)
        ? (payload.results as RawMovie[]).map(mapMovie)
        : [],
      total_results: typeof payload.total_results === 'number' ? payload.total_results : undefined,
      page: typeof payload.page === 'number' ? payload.page : undefined,
      total_pages: typeof payload.total_pages === 'number' ? payload.total_pages : undefined,
    }
  },

  trending: async (limit = 20): Promise<SearchResponse> => {
    const res = await apiClient.get<{ movies?: RawMovie[] }>('/trending', { params: { limit } })
    const movies: Movie[] = (res.data.movies ?? []).map((m) => ({
      id: (m.tmdb_id ?? m.id) as Movie['id'],
      title: m.title as string | undefined,
      name: m.title as string | undefined,
      overview: m.overview as string | undefined,
      poster_path: m.poster_path as string | undefined,
      backdrop_path: m.backdrop_path as string | undefined,
      release_date:
        typeof m.release_year === 'number' ? `${m.release_year}-01-01` : undefined,
      vote_average: m.vote_average as number | undefined,
      vote_count: m.vote_count as number | undefined,
      genre_ids: undefined,
      media_type: 'movie' as const,
    }))
    return { results: movies, total_results: movies.length }
  },

}
