import type { Movie, SearchResponse } from '@/types'
import { apiClient } from './client'
import { promise } from 'zod'

export const searchApi = {
  search: async (q: string, limit = 10): Promise<SearchResponse> => {
    const res = await apiClient.get<any>('/search', {
      params: { q, limit },
    })

    const payload = res.data

    console.debug('[searchApi] q="' + q + '" raw payload:', payload)

    if (Array.isArray(payload)) {
      return { results: payload, total_results: payload.length }
    }

    if (payload == null) {
      return { results: [], total_results: 0 }
    }

    // helper > map the movie data 
    const mapMovie = (m: any) => {
      return {
        id: m.id ?? m.tmdb_id ?? m.tmdbId ?? m.tmdbId ?? m.tmdb_id,
        title: m.title ?? m.name,
        name: m.name ?? m.title,
        overview: m.overview,
        poster_path: m.poster_path,
        backdrop_path: m.backdrop_path,
        release_date: m.release_date ?? (m.release_year ? String(m.release_year) + '-01-01' : undefined),
        first_air_date: m.first_air_date,
        vote_average: m.vote_average,
        vote_count: m.vote_count,
        genre_ids: Array.isArray(m.genre_ids) ? m.genre_ids : undefined,
        media_type: m.media_type,
      }
    }

    // payload.results (SearchResponse)
    if (Array.isArray(payload.results)) {
      return payload as SearchResponse
    }


    // payload.data might be an array or wrapped response
    if (Array.isArray(payload.data)) {
      return { results: payload.data.map(mapMovie), total_results: payload.data.length }
    }

    if (payload.data && Array.isArray(payload.data.results)) {
      return { ...payload.data, results: payload.data.results.map(mapMovie) }
    }

    // some APIs use items
    if (Array.isArray(payload.items)) {
      return { results: payload.items.map(mapMovie), total_results: payload.items.length }
    }

    if (Array.isArray(payload.movies)) {
      return { results: payload.movies.map(mapMovie), total_results: payload.movies.length }
    }

    // fallback: try to return payload if it matches SearchResponse-ish
    return {
      results: Array.isArray(payload.results) ? payload.results.map(mapMovie) : [],
      total_results: typeof payload.total_results === 'number' ? payload.total_results : undefined,
      page: payload.page,
      total_pages: payload.total_pages,
    }
  },

  trending: async (limit = 20): Promise<SearchResponse> => {
    const res = await apiClient.get<{ movies: any[] }>('/trending', { params: { limit } })
    const movies: Movie[] = (res.data.movies ?? []).map((m: any) => ({
      id: m.tmdb_id ?? m.id,
      title: m.title,
      name: m.title,
      overview: m.overview,
      poster_path: m.poster_path,
      backdrop_path: m.backdrop_path,
      release_date: m.release_year ? `${m.release_year}-01-01` : undefined,
      vote_average: m.vote_average,
      vote_count: m.vote_count,
      genre_ids: undefined,
      media_type: 'movie' as const,
    }))
    return { results: movies, total_results: movies.length }
  }, 

}
