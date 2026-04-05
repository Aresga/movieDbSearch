import { Heart, Eye, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlistStatus, useToggleWishlist, useWatchedStatus, useToggleWatched } from '@/hooks/useMovieLists'
import { cn } from '@/lib/utils'

interface MovieActionsProps {
    movieId: number | string
    variant?: 'pill' | 'icon'
}

export function MovieActions({ movieId, variant = 'pill' }: MovieActionsProps) {
    const { data: wishlistData } = useWishlistStatus(movieId)
    const { data: watchedData } = useWatchedStatus(movieId)
    const toggleWishlist = useToggleWishlist(movieId)
    const toggleWatched = useToggleWatched(movieId)

    const isInWishlist = wishlistData?.isInWishList || false
    const isInWatchedList = watchedData?.isInWatchedList || false

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
                        toggleWishlist.mutate(isInWishlist)
                    }}
                    disabled={toggleWishlist.isPending}
                    className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full',
                        'bg-black/50 text-white shadow-sm backdrop-blur-sm ring-1 ring-white/15',
                        'transition-colors hover:bg-black/65 hover:ring-white/25',
                        'disabled:pointer-events-none disabled:opacity-50',
                        isInWishlist && 'text-red-400 ring-red-400/40',
                    )}
                    aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart className={cn('size-3.5', isInWishlist && 'fill-current')} />
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
                        isInWatchedList && 'text-violet-300 ring-violet-400/35',
                    )}
                    aria-label={isInWatchedList ? 'Mark as not watched' : 'Mark as watched'}
                >
                    {isInWatchedList ? <Check className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
            </div>
        )
    }

    return (
        <div className="flex gap-3">
            <Button
                variant="outline"
                className={cn(
                    "h-9 px-4 rounded-full transition-all duration-300 gap-2 border",
                    // Use Tailwind classes instead of inline style
                    isInWishlist 
                        ? "bg-[#ff4d4d] border-[#ff4d4d] text-white hover:bg-[#ff3333]" 
                        : "bg-transparent border-white/20 text-muted-foreground hover:bg-accent"
                )}
                onClick={() => toggleWishlist.mutate(isInWishlist)}
                disabled={toggleWishlist.isPending}
            >
                {/* fill-white ensures the heart is filled when the button is red */}
                <Heart className={cn("h-4 w-4", isInWishlist && "fill-white")} />
                <span className="text-sm font-medium">
                    {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </span>
            </Button>

            <Button
                variant="outline"
                style={{
                    backgroundColor: isInWatchedList ? '#a855f7' : 'transparent',
                    borderColor: isInWatchedList ? '#a855f7' : 'rgba(255,255,255,0.2)',
                }}
                className={cn(
                    "h-9 px-4 rounded-full transition-all duration-300 gap-2 border",
                    isInWatchedList ? "text-white" : "text-muted-foreground hover:bg-accent"
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
