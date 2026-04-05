import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield, ShieldCheck, Pencil, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { useUpdateEmail, useUpdatePassword, useSetPassword } from '@/hooks/useUser'
import type { User } from '@/types'
import { useDisable2FA } from '@/hooks/useTwoFa'

const emailSchema = z.object({
  email: z.string().email(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'Minimum 8 characters'),
})

const setPasswordSchema = z.object({
  password: z.string().min(8, 'Minimum 8 characters'),
})

type EmailForm = z.infer<typeof emailSchema>
type PasswordForm = z.infer<typeof passwordSchema>
type SetPasswordForm = z.infer<typeof setPasswordSchema>

export function SecurityTab({ user }: { user: User }) {
  const { mutate: updateEmail, isPending: updatingEmail } = useUpdateEmail()
  const { mutate: updatePassword, isPending: updatingPassword } = useUpdatePassword()
  const { mutate: setPassword, isPending: settingPassword } = useSetPassword()
  const { mutate: disable2FA, isPending: disabling } = useDisable2FA()

  const [editingEmail, setEditingEmail] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [disable2faOpen, setDisable2faOpen] = useState(false)
  const [disable2faCode, setDisable2faCode] = useState('')

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  })

  const setPasswordForm = useForm<SetPasswordForm>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: '' },
  })

  useEffect(() => {
    emailForm.reset({ email: user.email ?? '' })
  }, [user, emailForm])

  const handleEmailSubmit = (data: EmailForm) => {
    updateEmail(data, {
      onSuccess: () => setEditingEmail(false),
    })
  }

  const handlePasswordSubmit = (data: PasswordForm) => {
    updatePassword(data, {
      onSuccess: () => {
        setEditingPassword(false)
        passwordForm.reset()
      },
    })
  }

  const handleSetPasswordSubmit = (data: SetPasswordForm) => {
    setPassword(data, {
      onSuccess: () => {
        setEditingPassword(false)
        setPasswordForm.reset()
      },
    })
  }

  const handleDisable2faOpenChange = (open: boolean) => {
    setDisable2faOpen(open)
    if (!open) setDisable2faCode('')
  }

  const handleConfirmDisable2fa = () => {
    if (disable2faCode.length !== 6) return
    disable2FA(disable2faCode, {
      onSuccess: () => handleDisable2faOpenChange(false),
    })
  }

  return (
    <div className="flex flex-col gap-4">

      {/* 2FA */}
    <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
        {user.isTwoFactorEnabled ? (
        <ShieldCheck className="size-5 text-green-500" />
        ) : (
        <Shield className="size-5 text-muted-foreground" />
        )}
        <div>
        <p className="text-sm font-semibold">Two-Factor Authentication</p>
        <p className="text-xs text-muted-foreground">
            {user.isTwoFactorEnabled ? 'Enabled — your account is protected' : 'Not enabled'}
        </p>
        </div>
    </div>

    {user.isTwoFactorEnabled ? (
        <>
        <Button
        variant="outline"
        size="sm"
        className="text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={() => setDisable2faOpen(true)}
        disabled={disabling}
        >
        Disable
        </Button>
        <Dialog open={disable2faOpen} onOpenChange={handleDisable2faOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disable two-factor authentication</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code from your authenticator app to confirm. This helps make sure only you can turn off 2FA.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-2">
              <InputOTP maxLength={6} value={disable2faCode} onChange={setDisable2faCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDisable2faOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={disable2faCode.length < 6 || disabling}
                onClick={handleConfirmDisable2fa}
              >
                {disabling ? 'Disabling…' : 'Disable 2FA'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </>
    ) : (
        <Button variant="outline" size="sm" asChild>
        <Link to="/2fa/setup">Enable</Link>
        </Button>
    )}
    </div>


      {/* Email */}
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold">Email Address</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1 text-muted-foreground"
            onClick={() => {
              setEditingEmail((v) => !v)
              if (editingEmail) emailForm.reset({ email: user.email ?? '' })
            }}
          >
            {editingEmail ? (
              <><X className="size-3" /> Cancel</>
            ) : (
              <><Pencil className="size-3" /> Edit</>
            )}
          </Button>
        </div>

        {/* Static view */}
        {!editingEmail && (
          <p className="text-sm text-muted-foreground">{user.email}</p>
        )}

        {/* Expanded edit form */}
        {editingEmail && (
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              className="flex flex-col gap-3 mt-3"
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="sm" disabled={updatingEmail} className="self-start">
                {updatingEmail ? 'Saving…' : 'Update Email'}
              </Button>
            </form>
          </Form>
        )}
      </div>

      {/* Password */}
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold">
            {user.hasPassword ? 'Password' : 'Set Password'}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1 text-muted-foreground"
            onClick={() => {
              setEditingPassword((v) => !v)
              if (editingPassword) {
                passwordForm.reset()
                setPasswordForm.reset()
              }
            }}
          >
            {editingPassword ? (
              <><X className="size-3" /> Cancel</>
            ) : (
              <><Pencil className="size-3" /> {user.hasPassword ? 'Change' : 'Set'}</>
            )}
          </Button>
        </div>

        {/* Static view */}
        {!editingPassword && (
          <p className="text-sm text-muted-foreground">
            {user.hasPassword ? '••••••••' : 'No password set — OAuth login only'}
          </p>
        )}

        {/* Expanded — change existing password */}
        {editingPassword && user.hasPassword && (
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
              className="flex flex-col gap-3 mt-3"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="sm" disabled={updatingPassword} className="self-start">
                {updatingPassword ? 'Saving…' : 'Change Password'}
              </Button>
            </form>
          </Form>
        )}

        {/* Expanded — set password for OAuth users */}
        {editingPassword && !user.hasPassword && (
          <Form {...setPasswordForm}>
            <form
              onSubmit={setPasswordForm.handleSubmit(handleSetPasswordSubmit)}
              className="flex flex-col gap-3 mt-3"
            >
              <p className="text-xs text-muted-foreground">
                Your account uses OAuth login. Setting a password lets you also log in with email.
              </p>
              <FormField
                control={setPasswordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="sm" disabled={settingPassword} className="self-start">
                {settingPassword ? 'Saving…' : 'Set Password'}
              </Button>
            </form>
          </Form>
        )}
      </div>

      {/* Member since */}
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <p className="text-sm font-semibold mb-0.5">Member since</p>
        <p className="text-xs text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString('en-US', {})}
        </p>
      </div>

    </div>
  )
}
