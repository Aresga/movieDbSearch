import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { useSocket } from '@/hooks/useSocket'
import { NotificationBell } from '../ui/NotificationBell'
import { ModeToggle } from '../ui/mode-toggle'
import { Footer } from './Footer'

/**
 * AppLayout Component
 * The main scaffolding for the private area of the application.
 * Initializes the global WebSocket connection, renders the sidebar, top navigation,
 * and standardizes the page content rendering area.
 */
export function AppLayout() {
  useSocket()
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <ModeToggle />
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-auto flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
