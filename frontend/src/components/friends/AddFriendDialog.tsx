import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddFriend } from '@/hooks/useFriends'

/**
 * AddFriendDialog Component
 * A modal window providing the UI to add someone via their exact username or email.
 */
export function AddFriendDialog() {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const { mutate: addFriend, isPending } = useAddFriend()

  const handleSubmit = () => {
    if (!userId.trim()) return
    addFriend(userId.trim(), {
      onSuccess: () => {
        setOpen(false)
        setUserId('')
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="size-4" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Friend</DialogTitle>
          <DialogDescription>Enter the user email or username of the person you want to add.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="user-id">Username or email</Label>
          <Input
            id="user-id"
            placeholder="e.g. johndoe"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !userId.trim()}>
            {isPending ? 'Sending…' : 'Send Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
