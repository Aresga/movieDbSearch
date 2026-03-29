import { Home, Users, User, Shield, Film, LogOut, LogIn, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,

  // SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'

const publicNavItems = [
  { title: 'Discover', url: '/home', icon: Home },
]

const authNavItems = [
  { title: 'My profile', url: '/user/me', icon: User },
  { title: 'Friends', url: '/friends', icon: Users },
  { title: 'Settings', url: '/settings', icon: Settings },
  { title: 'Chats', url: '/rooms', icon: Users }
  // { title: '2FA Security', url: '/2fa/setup', icon: Shield },
]

export function AppSidebar() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const { logout } = useLogout()
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <Sidebar collapsible='icon'>
    <SidebarHeader className="border-b border-border/1">
      <div className="flex items-center gap-2.5 px-2 py-3">
        <div className="bg-transparent rounded-md p-0 shrink-0">
          <Film className="text-white size-4" />
        </div>
        {!collapsed && (
          <span className="font-black text-lg tracking-tight">
            moviesearchdb
          </span>
        )}
      </div>
    </SidebarHeader>


      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Public nav — always visible */}
              {publicNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Auth-only nav — only visible when logged in */}
              {user && authNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.url)}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40">
        {/* <SidebarSeparator className="my-0" /> */}
        {user ? (
          /* Logged-in footer — user info + logout */
          <div className="flex items-center gap-3 ">
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="text-xs font-semibold bg-brand/20 text-brand">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={logout}
              title="Log out"
            >
            {!collapsed && (
              <LogOut className="size-4" />
              
            )}  
            </Button>
          </div>
        ) : (
          /* Guest footer — sign in CTA */
          <div className="px-2 py-3">
            <Button asChild className="w-full" size="sm">
              <Link to="/login">
                <LogIn className="size-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              or{' '}
              <Link to="/register" className="underline underline-offset-2 hover:text-foreground">
                create an account
              </Link>
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
