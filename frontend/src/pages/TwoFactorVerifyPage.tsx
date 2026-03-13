import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useAuthStore } from '@/store/authStore'
import { useVerifyTwoFa } from '@/hooks/useTwoFa'

export function TwoFactorVerifyPage() {
  const { tempToken } = useAuthStore()
  console.log('[2fa verify page] tempToken:', tempToken)
  const { mutate: verify, isPending } = useVerifyTwoFa()
  const navigate = useNavigate()
  const [code, setCode] = useState('')

  // if (!tempToken) return <Navigate to="/login" replace />

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length === 6) verify(code)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        <div className="bg-brand/10 rounded-full p-4">
          <Shield className="size-8 text-brand" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            type="submit"
            className="w-full"
            disabled={code.length < 6 || isPending}
          >
            {isPending ? 'Verifying…' : 'Verify'}
          </Button>
        </form>

        <Button
          variant="ghost"
          className="text-sm text-muted-foreground"
          onClick={() => navigate('/login')}
        >
          Back to login
        </Button>
      </div>
    </div>
  )
}
