import { useEffect, useState } from 'react'
import { Search, Flame, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MovieGrid } from '@/components/movies/MovieGrid'
import { useSearch } from '@/hooks/useSearch'
import { useTrending } from '@/hooks/useSearch'
import { RecommendedSection } from '@/components/home/RecommendedSection'
import { useAuthStore } from '@/store/authStore'
import type { SearchResponse } from '@/types'

const getGridColumns = (width: number) => {
  if (width >= 1280) return 6
  if (width >= 1024) return 5
  if (width >= 768) return 4
  if (width >= 640) return 3
  return 2
}

const getResponsivePageSize = (width: number, height: number) => {
  const columns = getGridColumns(width)
  const rows = height >= 900 ? 4 : 3
  return columns * rows
}

function GuestBanner() {
  return (
    <div className="mx-6 mt-6 rounded-xl border border-brand/20 bg-brand/5 px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold">Want more?</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Sign in to save movies, track your watchlist and connect with friends.
        </p>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <Link to="/login">
          <LogIn className="size-3.5 mr-1.5" />
          Sign In
        </Link>
      </Button>
    </div>
  )
}

export function HomePage() {
  const user = useAuthStore((s) => s.user)
  const [inputValue, setInputValue] = useState('')
  const [query, setQuery] = useState('')
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window === 'undefined') return 12
    return getResponsivePageSize(window.innerWidth, window.innerHeight)
  })

  useEffect(() => {
    let frameId = 0

    const handleResize = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        const nextSize = getResponsivePageSize(window.innerWidth, window.innerHeight)
        setPageSize((currentSize) => (currentSize === nextSize ? currentSize : nextSize))
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const searchResult = useSearch(query, pageSize)
  const trendingResult = useTrending(pageSize)

  // If no active search, show trending
  const isSearching = !!query
  const { data, isLoading, isError } = isSearching ? searchResult : trendingResult
  const fetchNextPage = isSearching ? searchResult.fetchNextPage : trendingResult.fetchNextPage
  const hasNextPage = isSearching ? searchResult.hasNextPage : trendingResult.hasNextPage
  const isFetchingNextPage = isSearching
    ? searchResult.isFetchingNextPage
    : trendingResult.isFetchingNextPage

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) setQuery(inputValue.trim())
  }

  const handleClear = () => {
    setQuery('')
    setInputValue('')
  }

  const pages = (data?.pages ?? []) as SearchResponse[]
  const movies = pages.flatMap((page) => page.results)

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero */}
      <div className="px-6 pt-8 pb-6 border-b border-border/50 bg-gradient-to-b from-brand/5 to-transparent">
        <h1 className="text-2xl font-black tracking-tight mb-1">
          {user ? `Welcome back, ${user.username}` : 'Discover Movies with Semantic Search'}
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          {user
            ? 'Describe a vibe, plot, or mood and find the right movie faster.'
            : 'This is semantic search: describe what you want, not just exact title keywords.'}
        </p>
        <p className="text-xs text-muted-foreground/90 mb-3">
          Try: "dark psychological thriller with a plot twist" or "feel-good family road trip movie".
        </p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="movie-search-query"
              name="movieSearchQuery"
              className="pl-9"
              placeholder="Describe a movie idea, mood, or story..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={!inputValue.trim()}>Search</Button>
          {isSearching && (
            <Button type="button" variant="outline" onClick={handleClear}>Clear</Button>
          )}
        </form>
      </div>

      {!user && <GuestBanner />}

          <RecommendedSection pageSize={pageSize} isSearching={isSearching} />

      {/* Results */}
      <div className="p-6 flex-1">
        {isError && (
          <Alert variant="destructive" className="mb-4 max-w-xl">
            <AlertDescription>Failed to connect to the backend.</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2 mb-4">
          {isSearching
            ? <Search className="size-4 text-muted-foreground" />
            : <Flame className="size-4 text-orange-400" />
          }
          <p className="text-sm text-muted-foreground">
            {isSearching
              ? <><strong className="text-foreground">"{query}"</strong> — {movies.length} results</>
              : <strong className='text-foreground'>Trending right now</strong>
            }
          </p>
        </div>

        <MovieGrid movies={movies} isLoading={isLoading} query={query || 'trending'} />

        {hasNextPage && (
          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => fetchNextPage?.()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
