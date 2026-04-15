import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'

export function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-sm text-muted-foreground">Join moviesearchdb and start tracking</p>
      </div>

      <RegisterForm />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase">
          <span className="bg-inherit px-2 text-muted-foreground tracking-widest">
            or sign up with
          </span>
        </div>
      </div>

      <OAuthButtons />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-foreground hover:text-brand transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
