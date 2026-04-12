import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Lists = { wishlistTmdbIds: number[]; watchedTmdbIds: number[] }

const emptyLists = (): Lists => ({ wishlistTmdbIds: [], watchedTmdbIds: [] })

type State = {
  byUserId: Record<string, Lists>
  addWishlist: (userId: string, tmdbId: number) => void
  removeWishlist: (userId: string, tmdbId: number) => void
  addWatched: (userId: string, tmdbId: number) => void
  removeWatched: (userId: string, tmdbId: number) => void
  syncWishlistFromApi: (userId: string, tmdbIds: number[]) => void
  syncWatchedFromApi: (userId: string, tmdbIds: number[]) => void
}

export const useMovieListsMirrorStore = create<State>()(
  persist(
    (set) => ({
      byUserId: {},
      addWishlist: (userId, tmdbId) =>
        set((s) => {
          const cur = s.byUserId[userId] ?? emptyLists()
          if (cur.wishlistTmdbIds.includes(tmdbId)) return s
          return {
            byUserId: {
              ...s.byUserId,
              [userId]: { ...cur, wishlistTmdbIds: [tmdbId, ...cur.wishlistTmdbIds] },
            },
          }
        }),
      removeWishlist: (userId, tmdbId) =>
        set((s) => {
          const cur = s.byUserId[userId] ?? emptyLists()
          return {
            byUserId: {
              ...s.byUserId,
              [userId]: { ...cur, wishlistTmdbIds: cur.wishlistTmdbIds.filter((x) => x !== tmdbId) },
            },
          }
        }),
      addWatched: (userId, tmdbId) =>
        set((s) => {
          const cur = s.byUserId[userId] ?? emptyLists()
          if (cur.watchedTmdbIds.includes(tmdbId)) return s
          return {
            byUserId: {
              ...s.byUserId,
              [userId]: { ...cur, watchedTmdbIds: [tmdbId, ...cur.watchedTmdbIds] },
            },
          }
        }),
      removeWatched: (userId, tmdbId) =>
        set((s) => {
          const cur = s.byUserId[userId] ?? emptyLists()
          return {
            byUserId: {
              ...s.byUserId,
              [userId]: { ...cur, watchedTmdbIds: cur.watchedTmdbIds.filter((x) => x !== tmdbId) },
            },
          }
        }),
      syncWishlistFromApi: (userId, tmdbIds) =>
        set((s) => {
          const cur = s.byUserId[userId] ?? emptyLists()
          const merged = [...new Set([...tmdbIds, ...cur.wishlistTmdbIds])]
          return {
            byUserId: {
              ...s.byUserId,
              [userId]: { ...cur, wishlistTmdbIds: merged },
            },
          }
        }),
      syncWatchedFromApi: (userId, tmdbIds) =>
        set((s) => {
          const cur = s.byUserId[userId] ?? emptyLists()
          const merged = [...new Set([...tmdbIds, ...cur.watchedTmdbIds])]
          return {
            byUserId: {
              ...s.byUserId,
              [userId]: { ...cur, watchedTmdbIds: merged },
            },
          }
        }),
    }),
    { name: 'moviedb-lists-mirror' },
  ),
)
