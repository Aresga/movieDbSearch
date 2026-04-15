/**
 * Standardized CastMember properties mapped from TMDB.
 */
export interface CastMember {
  id: number
  name: string
  character?: string
  profile_path?: string
}

export interface MovieCastProps {
  cast: CastMember[]
}

/**
 * MovieCast Component
 * Renders a horizontally-scrollable list of top billed cast members.
 */
export function MovieCast({ cast }: MovieCastProps) {
  if (cast.length === 0) return null

  return (
    <section className="mt-8 mb-10 max-w-5xl mx-auto pl-2 pr-2">
      <h2 className="text-lg font-semibold mb-3 pl-4">Top billed cast</h2>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2">
          {cast.map((p) => (
            <div key={p.id} className="flex-shrink-0 w-28 rounded-lg border bg-card overflow-hidden">
              {p.profile_path ? (
                <img
                  className="w-full aspect-[2/3] object-cover"
                  src={`https://image.tmdb.org/t/p/w185${p.profile_path}`}
                  alt={p.name}
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center text-2xl text-muted-foreground">
                  🎭
                </div>
              )}
              <div className="p-2">
                <p className="text-xs font-semibold leading-snug">{p.name}</p>
                {p.character && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.character}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  )
}
