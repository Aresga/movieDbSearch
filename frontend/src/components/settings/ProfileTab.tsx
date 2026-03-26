import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateMe } from '@/hooks/useUser'
import type { User } from '@/types'

const profileSchema = z.object({
  username: z.string().min(3),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export function ProfileTab({ user }: { user: User }) {
  const { mutate: updateMe, isPending: updating } = useUpdateMe()

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: '', bio: '', avatarUrl: '' },
  })

  useEffect(() => {
    form.reset({
      username: user.username,
      avatarUrl: user.avatarUrl ?? '',
      bio: user.bio ?? '',
    })
  }, [user, form])

  const onSubmit = (data: ProfileForm) => {
    const dirtyFields = form.formState.dirtyFields
    const changedData: Partial<ProfileForm> = {}

    if (dirtyFields.username) changedData.username = data.username
    if (dirtyFields.avatarUrl) changedData.avatarUrl = data.avatarUrl
    if (dirtyFields.bio) changedData.bio = data.bio

    if (Object.keys(changedData).length === 0) return

    updateMe(changedData)
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
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input placeholder="https://…" {...field} />
              </FormControl>
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
        <Button type="submit" disabled={updating} className="self-start">
          {updating ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  )
}
