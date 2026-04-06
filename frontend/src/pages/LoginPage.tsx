import { Link, useLocation } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoginForm } from '@/components/auth/LoginForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'

type LoginLocationState = { registered?: boolean; username?: string }

export function LoginPage() {
  const location = useLocation()
  const state = location.state as LoginLocationState | null
  const justRegistered = Boolean(state?.registered)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your moviesearchdb account</p>
      </div>

      {justRegistered && (
        <Alert className="border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50">
          <AlertDescription>
            {state?.username ? (
              <>
                Welcome, <span className="font-semibold">{state.username}</span>. Your account is ready—sign in
                below with your email and password.
              </>
            ) : (
              <>Your account was created successfully. Sign in below with your email and password.</>
            )}
          </AlertDescription>
        </Alert>
      )}

      <LoginForm />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase">
          <span className="bg-inherit px-2 text-muted-foreground tracking-widest">
            or continue with
          </span>
        </div>
      </div>

      <OAuthButtons />

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-foreground hover:text-brand transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  )
}
