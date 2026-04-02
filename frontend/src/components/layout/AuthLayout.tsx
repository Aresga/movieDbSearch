import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Film } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { generateSlug } from 'random-word-slugs'
import { Footer } from './Footer'



export function AuthLayout() {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()

  if (token) return <Navigate to="/home" replace />

  const isLoginPage = location.pathname === '/login'

  const word = generateSlug(1, {
    partsOfSpeech: ['noun'],
    categories: {
      noun: ['media'],
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex">
        {/* Decorative left panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black flex-col justify-end">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage: `url(https://picsum.photos/seed/${word}/900/1200)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="relative z-10 p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-transparent rounded-md p-2">
                <Film className="text-white size-4" />
              </div>
              <span className="text-3xl font-black tracking-tight text-white">moviesearchdb</span>
            </div>
            <p className="text-xl text-white/80 leading-relaxed max-w-sm">
              Track, discover, and share your favourite movies with friends.
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="bg-transparent rounded-md p-1.5">
                <Film className="text-foreground size-4" />
              </div>
              <span className="text-xl font-black text-foreground">moviesearchdb</span>
            </div>
            <Outlet />
          </div>
        </div>
      </div>
      {!isLoginPage && <Footer />}
    </div>
  )
}
