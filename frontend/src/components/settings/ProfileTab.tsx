import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { userApi } from '@/api/user'
import { useUpdateMe } from '@/hooks/useUser'
import { getApiErrorMessage } from '@/lib/apiError'
import type { User } from '@/types'

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
const MAX_AVATAR_BYTES = 5 * 1024 * 1024

const profileSchema = z.object({
  username: z.string().min(3),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
})

export type ProfileForm = z.infer<typeof profileSchema>

/**
 * ProfileTab Component
 * Renders a reactive form to update public-facing user profile information.
 * Uses React Hook Form's dirtyFields tracking to optimally patch only modified fields.
 */
export function ProfileTab({ user }: { user: User }) {
  const { mutateAsync: updateMeAsync, isPending: updating } = useUpdateMe()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: '', bio: '', avatarUrl: '' },
  })

  const { isDirty } = form.formState

  useEffect(() => {
    form.reset({
      username: user.username,
      avatarUrl: user.avatarUrl ?? '',
      bio: user.bio ?? '',
    })
  }, [user, form])

  const onSubmit = async (data: ProfileForm) => {
    const dirtyFields = form.formState.dirtyFields
    const changedData: Partial<ProfileForm> = {}

    if (dirtyFields.username) changedData.username = data.username
    if (dirtyFields.avatarUrl) changedData.avatarUrl = data.avatarUrl
    if (dirtyFields.bio) changedData.bio = data.bio

    if (Object.keys(changedData).length === 0) return

    try {
      const saved = await updateMeAsync(changedData)
      form.reset({
        username: saved.username,
        avatarUrl: saved.avatarUrl ?? '',
        bio: saved.bio ?? '',
      })
    } catch {
      /* toast from useUpdateMe */
    }
  }

  const onAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!AVATAR_TYPES.includes(file.type as (typeof AVATAR_TYPES)[number])) {
      toast.error('Use a JPEG, PNG, WebP, or GIF image.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error('Image must be 5 MB or smaller.')
      return
    }

    setUploadingAvatar(true)
    try {
      const { publicUrl } = await userApi.uploadAvatar(file)
      const saved = await updateMeAsync({ avatarUrl: publicUrl })
      form.reset({
        username: saved.username,
        avatarUrl: saved.avatarUrl ?? publicUrl,
        bio: saved.bio ?? '',
      })
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile picture</FormLabel>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <FormControl>
                  <Input placeholder="https://…" {...field} className="sm:flex-1" />
                </FormControl>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={AVATAR_TYPES.join(',')}
                  className="hidden"
                  onChange={onAvatarFile}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={uploadingAvatar || updating}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingAvatar ? 'Uploading…' : 'Upload photo'}
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Add a picture with a direct image URL, or upload a file (JPEG, PNG, WebP, or GIF,
                up to 5 MB). New uploads replace your current photo.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a bit about yourself…"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={updating || !isDirty}
          variant={isDirty ? 'default' : 'secondary'}
          className="self-start"
        >
          {updating ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
