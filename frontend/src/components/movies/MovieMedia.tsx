import { useState } from 'react'

/**
 * Standard YouTube video parameters retrieved from TMDB mapping.
 */
export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
}

export interface MovieMediaProps {
  videos: Video[]
}

/**
 * MovieMedia Component
 * Manages the display and integrated playback of Trailers and Teasers.
 * Renders a scrollable thumbnail gallery and loads an actively selected trailer
 * directly via YouTube iframe in a full-screen theater mode.
 */
export function MovieMedia({ videos }: MovieMediaProps) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  const youtubeVideos = videos.filter(
    (v) => v.site === 'YouTube' && (v.type === 'Teaser' || v.type === 'Trailer')
  )

  if (youtubeVideos.length === 0) return null

  const sorted = youtubeVideos.sort((a, b) => {
    const order: Record<string, number> = { Trailer: 0, Teaser: 1 }
    return (order[a.type] ?? 2) - (order[b.type] ?? 2)
  })

  return (
    <section className="mt-8 max-w-5xl mx-auto">
      <h2 className="text-lg font-semibold mb-3">Media</h2>

      {/* Lightbox / active player */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <button
            className="absolute top-4 right-4 text-white text-sm bg-white/10 hover:bg-white/20 rounded-full px-3 py-1"
            onClick={() => setActiveVideo(null)}
          >
            ✕ Close
          </button>
        </div>
      )}

      {/* Scrollable list of thumbnails */}
      <div className="flex flex-row gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2">
        {sorted.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveVideo(v.key)}
            className="flex-shrink-0 w-56 rounded-lg hover:opacity-80 transition-opacity group overflow-hidden text-left"
          >
            <div className="relative w-full aspect-video">
              <img
                src={`https://img.youtube.com/vi/${v.key}/mqdefault.jpg`}
                alt={v.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                <div className="bg-white/90 rounded-full w-9 h-9 flex items-center justify-center">
                  <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-2">
              <p className="text-xs font-semibold line-clamp-2">{v.name}</p>
              <span className="text-xs text-muted-foreground">{v.type}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
