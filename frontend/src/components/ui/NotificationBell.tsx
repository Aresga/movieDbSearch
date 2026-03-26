import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useNotificationStore } from '@/hooks/useNotificationStore'
import { formatDistanceToNow } from 'date-fns'

// /// @TODO 
// function useNotifications() {
//   const { data: friends = [] } = useFriends()
//   return friends.slice(0, 3).map((f) => ({
//     id: f.id,
//     message: `${f.username} is now your friend`,
//   }))
// }


export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, markAllRead, clear } = useNotificationStore()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <Popover open={open} onOpenChange={(val) => {
      setOpen(val)
      if (val) markAllRead()
    }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-8 text-muted-foreground hover:text-foreground">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <span className="text-sm font-semibold">Notifications</span>
          {notifications.length > 0 && (
            <button onClick={clear} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-col divide-y divide-border/40 max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className={`px-4 py-3 text-sm transition-colors hover:bg-muted/50 ${!n.read ? 'bg-brand/5' : ''}`}>
                <p>{n.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                </p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
