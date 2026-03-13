import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/api/client'
import type { User } from '@/types'


export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const error = searchParams.get('error')

    // 2FA required — partial cookie already set by backend, just redirect
    if (error === '2fa_required') {
      navigate('/2fa/verify')
      return
    }

    // any other error
    if (error) {
      toast.error('OAuth sign-in failed. Please try again.')
      navigate('/login')
      return
    }

    // success — fetch user profile (cookie is set)
    const fetchUser = async () => {
      try {
        const res = await apiClient.get<User>('/user/me')
        setAuth(res.data)
        toast.success('Signed in successfully!')
        navigate('/home')
      } catch {
        toast.error('Could not verify your session. Please try again.')
        navigate('/login')
      }
    }

    fetchUser()
  }, [searchParams, setAuth, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-10 animate-spin text-brand" />
        <p className="text-muted-foreground">Completing sign-in…</p>
      </div>
    </div>
  )
}
