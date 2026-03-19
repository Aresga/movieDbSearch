import { useState } from 'react'
import { Shield, ShieldCheck, Trash2, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMe } from '@/hooks/useUser'
import { ProfileTab } from '@/components/settings/ProfileTab'
import { SecurityTab } from '@/components/settings/SecurityTab'
import { DangerTab } from '@/components/settings/DangerTab'

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-lg">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

export function SettingsPage() {
  const { data: user, isLoading } = useMe()
  const [tab, setTab] = useState('profile')

  if (isLoading) return <ProfileSkeleton />

  if (!user) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Failed to load profile.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const initials = user.username.slice(0, 2).toUpperCase()

  return (
    <div className="p-6 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="size-16">
          <AvatarImage src={user.avatarUrl ?? `https://i.pravatar.cc/64?u=${user.id}`} />
          <AvatarFallback className="bg-brand/20 text-brand text-xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{user.username}</h1>
          <div className="flex gap-2 mt-1">
            {user.isTwoFactorEnabled ? (
              <Badge variant="secondary" className="gap-1 text-green-500">
                <ShieldCheck className="size-3" /> 2FA On
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 text-muted-foreground">
                <Shield className="size-3" /> 2FA Off
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="profile" className="flex-1 gap-1.5">
            <User className="size-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 gap-1.5">
            <Shield className="size-3.5" /> Security
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex-1 gap-1.5">
            <Trash2 className="size-3.5" /> Danger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab user={user} />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab user={user} />
        </TabsContent>

        <TabsContent value="danger">
          <DangerTab user={user} />
        </TabsContent>
      </Tabs>

    </div>
  )
}
