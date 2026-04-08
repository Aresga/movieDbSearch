import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRegister } from '@/hooks/useAuth'

/**
 * Validation schema for the registration form.
 * Ensures strict checks on password pairing during account setup.
 */
const schema = z
  .object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(64, 'Password must not exceed 64 characters'),
    confirmPassword: z.string()
      .min(8, 'Confirm password must be at least 8 characters')
      .max(64, 'Confirm password must not exceed 64 characters'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

/**
 * RegisterForm Component
 * Fully encapsulates user registration via hook-form, integrating with the useRegister mutation hook.
 */
export function RegisterForm() {
  const { mutate: register, isPending } = useRegister()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = ({ username, email, password }: FormData) =>
    register({ username, email, password })

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
                <Input placeholder="johndoe" autoComplete="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Min 8 characters" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full mt-2" disabled={isPending}>
          {isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </Form>
  )
}
