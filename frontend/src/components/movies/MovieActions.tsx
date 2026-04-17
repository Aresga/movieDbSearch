import { Heart, Eye, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMovieListMembership, useToggleWishlist, useToggleWatched } from '@/hooks/useMovieLists'
import { cn } from '@/lib/utils'

interface MovieActionsProps {
    movieId: number | string
    variant?: 'pill' | 'icon'
}

export function MovieActions({ movieId, variant = 'pill' }: MovieActionsProps) {
    const { isInWishList, isInWatchedList } = useMovieListMembership(movieId)
    const toggleWishlist = useToggleWishlist(movieId)
    const toggleWatched = useToggleWatched(movieId)

    if (variant === 'icon') {
        return (
            <div
                className={cn(
                    'absolute left-2 top-2 z-20 flex flex-row gap-1',
                    'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                )}
            >
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleWishlist.mutate(isInWishList)
                    }}
                    disabled={toggleWishlist.isPending}
                    className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full',
                        'bg-black/50 text-white shadow-sm backdrop-blur-sm ring-1 ring-white/15',
                        'transition-colors hover:bg-black/65 hover:ring-white/25',
                        'disabled:pointer-events-none disabled:opacity-50',
                        isInWishList && 'text-red-400 ring-red-400/40',
                    )}
                    aria-label={isInWishList ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart className={cn('size-3.5', isInWishList && 'fill-current')} />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleWatched.mutate(isInWatchedList)
                    }}
                    disabled={toggleWatched.isPending}
                    className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full',
                        'bg-black/50 text-white shadow-sm backdrop-blur-sm ring-1 ring-white/15',
                        'transition-colors hover:bg-black/65 hover:ring-white/25',
                        'disabled:pointer-events-none disabled:opacity-50',
                        isInWatchedList && 'text-emerald-300 ring-emerald-400/35',
                    )}
                    aria-label={isInWatchedList ? 'Mark as not watched' : 'Mark as watched'}
                >
                    {isInWatchedList ? <Check className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
            </div>
        )
    }

    return (
        <div className="flex gap-3 md:gap-4 py-8">
            <Button
                variant="outline"
                className={cn(
                    "h-9 px-4 rounded-full transition-all duration-300 gap-2 border backdrop-blur-sm !shadow-none",
                    isInWishList 
                        ? "!bg-rose-500/90 !border-rose-400 !text-white hover:!bg-rose-500 hover:!text-white"
                        : "!bg-black/45 !border-white/20 !text-white hover:!bg-black/60 hover:!text-white"
                )}
                onClick={() => toggleWishlist.mutate(isInWishList)}
                disabled={toggleWishlist.isPending}
            >
                {/* fill-white ensures the heart is filled when the button is red */}
                <Heart className={cn("h-4 w-4", isInWishList && "fill-white")} />
                <span className="text-sm font-medium">
                    {isInWishList ? 'In Wishlist' : 'Add to Wishlist'}
                </span>
            </Button>

            <Button
                variant="outline"
                className={cn(
                    "h-9 px-4 rounded-full transition-all duration-300 gap-2 border backdrop-blur-sm !shadow-none",
                    isInWatchedList
                        ? "!bg-emerald-500/90 !border-emerald-400 !text-white hover:!bg-emerald-500 hover:!text-white"
                        : "!bg-black/45 !border-white/20 !text-white hover:!bg-black/60 hover:!text-white"
                )}
                onClick={() => toggleWatched.mutate(isInWatchedList)}
                disabled={toggleWatched.isPending}
            >
                {isInWatchedList ? (
                    <Check className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                    {isInWatchedList ? 'Watched' : 'Mark as Watched'}
                </span>
            </Button>
        </div>
    )
}
