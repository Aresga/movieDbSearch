import { useState } from 'react'
import { Shield, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Skeleton } from '@/components/ui/skeleton'
import { QRCodeDisplay } from '@/components/twofa/QRCodeDisplay'
import { useTwoFaSetup, useActivateTwoFa } from '@/hooks/useTwoFa'
import { useAuthStore } from '@/store/authStore'

export function TwoFactorSetupPage() {
  const user = useAuthStore((s) => s.user)
  const [showSetup, setShowSetup] = useState(false)
  const [code, setCode] = useState('')
  const [activated, setActivated] = useState(false)

  const { data, isLoading, isError } = useTwoFaSetup()
  const { mutate: activate, isPending } = useActivateTwoFa()

  const handleActivate = () => {
    if (code.length === 6) {
      activate(code, { onSuccess: () => setActivated(true) })
    }
  }

  if (user?.isTwoFactorEnabled && !activated) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="size-6 text-green-500" />
          <h1 className="text-xl font-bold">2FA is Active</h1>
        </div>
        <Alert>
          <ShieldCheck className="size-4" />
          <AlertDescription>
            Two-factor authentication is already enabled on your account. Your account is protected.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (activated) {
    return (
      <div className="p-6 max-w-lg mx-auto flex flex-col items-center gap-4 text-center pt-20">
        <div className="bg-green-500/10 rounded-full p-4">
          <ShieldCheck className="size-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">2FA Enabled!</h1>
        <p className="text-muted-foreground">Your account is now protected with two-factor authentication.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="size-6 text-brand" />
        <h1 className="text-xl font-bold">Setup Two-Factor Authentication</h1>
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Add an extra layer of security to your account by enabling 2FA.
      </p>

      {!showSetup ? (
        <Button className="gap-2" onClick={() => setShowSetup(true)}>
          <Shield className="size-4" />
          Enable 2FA
        </Button>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border/50 bg-card p-6 flex flex-col gap-4">
            <div>
              <h2 className="font-semibold text-sm">Step 1 — Scan QR Code</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Open your authenticator app (Google Authenticator, Authy…) and scan the code below.
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="size-[212px] rounded-xl" />
                <Skeleton className="h-8 w-64" />
              </div>
            ) : isError ? (
              <Alert variant="destructive">
                <AlertDescription>Failed to load setup data. Please try again.</AlertDescription>
              </Alert>
            ) : data ? (
              <QRCodeDisplay url={data.qr_code_url} secret={data.secret} />
            ) : null}
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6 flex flex-col gap-4">
            <div>
              <h2 className="font-semibold text-sm">Step 2 — Verify</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Enter the 6-digit code from your app to confirm setup.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
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
                className="w-full"
                onClick={handleActivate}
                disabled={code.length < 6 || isPending}
              >
                {isPending ? 'Activating…' : 'Activate 2FA'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
