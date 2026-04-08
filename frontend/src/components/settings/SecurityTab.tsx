import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield, ShieldCheck, Pencil, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useUpdateEmail, useUpdatePassword, useSetPassword } from '@/hooks/useUser'
import type { User } from '@/types'
import { useDisable2FA } from '@/hooks/useTwoFa'

const emailSchema = z.object({
  email: z.string().email(),
})

const passwordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Minimum 8 characters')
    .max(64, 'Maximum 64 characters'),
})

const setPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Minimum 8 characters')
    .max(64, 'Maximum 64 characters'),
})

type EmailForm = z.infer<typeof emailSchema>
type PasswordForm = z.infer<typeof passwordSchema>
type SetPasswordForm = z.infer<typeof setPasswordSchema>

/**
 * SecurityTab Component
 * The foundational dashboard for managing private user credentials.
 * Operates sub-forms for email updates, password resets, and initial password setting for OAuth.
 * Delegates 2FA enablement to a dedicated visual route block.
 */
export function SecurityTab({ user }: { user: User }) {
  const { mutate: updateEmail, isPending: updatingEmail } = useUpdateEmail()
  const { mutate: updatePassword, isPending: updatingPassword } = useUpdatePassword()
  const { mutate: setPassword, isPending: settingPassword } = useSetPassword()
  const { mutate: disable2FA, isPending: disabling } = useDisable2FA()

  const [editingEmail, setEditingEmail] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)

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
    defaultValues: { newPassword: '' },
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

  return (
    <div className="flex flex-col gap-4">

      {/* 2FA — unchanged */}
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                disabled={disabling}
              >
                {disabling ? 'Disabling…' : 'Disable'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove an extra layer of security from your account. You will no longer need a verification code to sign in.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => disable2FA()}
                >
                  Yes, disable 2FA
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
