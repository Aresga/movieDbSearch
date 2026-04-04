import type { Movie, SearchResponse } from '@/types'
import { apiClient } from './client'

/**
 * Normalizes raw payload data from the backend into a standardized Movie object.
 * Handles inconsistencies in ID fields, title vs name, and date formatting.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeMovieData = (m: any): Movie => {
  const id = m.id ?? m.tmdb_id ?? m.tmdbId
  if (id == null) {
    console.warn('normalizeMovieData: item has missing ID, data may be incomplete', m)
  }
  return {
    id,
    title: m.title ?? m.name,
    name: m.name ?? m.title,
    overview: m.overview,
    poster_path: m.poster_path,
    backdrop_path: m.backdrop_path,
    release_date: m.release_date ?? (m.release_year ? `${m.release_year}-01-01` : undefined),
    first_air_date: m.first_air_date,
    vote_average: m.vote_average,
    vote_count: m.vote_count,
    genre_ids: Array.isArray(m.genre_ids) ? m.genre_ids : undefined,
    media_type: m.media_type ?? 'movie', // Default to movie if omitted
  }
}

/**
 * Search API Service
 * Handles querying for movies, TV shows, and trending content.
 */
export const searchApi = {
  /**
   * Searches the backend database based on a query string.
   * Defensively normalizes data regardless of API structure.
   * @param q - The search query string.
   * @param limit - The maximum number of results to return (default: 10).
   * @returns A promise resolving to a normalized SearchResponse.
   */
  search: async (q: string, limit = 10): Promise<SearchResponse> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>('/search', {
      params: { q, limit },
    })

    const payload = res.data

    // 1. Raw array payload
    if (Array.isArray(payload)) {
      return { results: payload.map(normalizeMovieData), total_results: payload.length }
    }

    if (payload == null) {
      return { results: [], total_results: 0 }
    }

    // 2. Standard '{ results: [...] }' payload
    if (Array.isArray(payload.results)) {
      return { ...payload, results: payload.results.map(normalizeMovieData) }
    }

    // 3. Nested '{ data: [...] }' payload
    if (Array.isArray(payload.data)) {
      return { results: payload.data.map(normalizeMovieData), total_results: payload.data.length }
    }

    // 4. Nested '{ data: { results: [...] } }'
    if (payload.data && Array.isArray(payload.data.results)) {
      return { ...payload.data, results: payload.data.results.map(normalizeMovieData) }
    }

    // 5. Item/Movies variations '{ items: [...] }' or '{ movies: [...] }'
    if (Array.isArray(payload.items)) {
      return { results: payload.items.map(normalizeMovieData), total_results: payload.items.length }
    }

    if (Array.isArray(payload.movies)) {
      return { results: payload.movies.map(normalizeMovieData), total_results: payload.movies.length }
    }

    // 6. Absolute Fallback
    return {
      results: Array.isArray(payload.results) ? payload.results.map(normalizeMovieData) : [],
      total_results: typeof payload.total_results === 'number' ? payload.total_results : undefined,
      page: payload.page,
      total_pages: payload.total_pages,
    }
  },

  /**
   * Retrieves trending/popular movies.
   * @param limit - The maximum number of trending results to return (default: 20).
   * @returns A promise resolving to a normalized SearchResponse.
   */
  trending: async (limit = 20): Promise<SearchResponse> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<{ movies: any[] }>('/trending', { params: { limit } })

    // Leverage the standard utility mapper
    const movies: Movie[] = (res.data.movies ?? []).map(normalizeMovieData)

    return { results: movies, total_results: movies.length }
  },
}
