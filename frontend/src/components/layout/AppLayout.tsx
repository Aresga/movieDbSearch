import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
// import { Separator } from '@/components/ui/separator'
import { AppSidebar } from './AppSidebar'
import { useSocket } from '@/hooks/useSocket'
import { NotificationBell } from '../ui/NotificationBell'
import { ModeToggle } from '../ui/mode-toggle'

export function AppLayout() {
  useSocket()
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-4">
          <SidebarTrigger className="-ml-1" />
          {/* <Separator orientation="vertical" className="h-4 mr-2" /> */}
          <div className="flex-1" />
          <ModeToggle />
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
