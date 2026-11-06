import { useState } from 'react';
import { Menu, PanelLeftClose, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSantriNotifications } from '@/hooks/use-santri';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { usePublicData } from '@/hooks/use-public-data';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, LogOut, User } from 'lucide-react';
interface AppHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onMobileOpen: () => void;
}
const AppHeader = ({ sidebarCollapsed, onToggleSidebar, onMobileOpen }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { data } = useSantriNotifications();
  const notifications = data || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;
  const { data: settings } = usePublicData<any>(['settings'], '/core/settings');
  const { user, logout } = useAuthStore();
  const userIdentifier = user?.username || user?.id || '';
  const getAvatarUrl = () => {
    if (user?.avatar) return user.avatar;
    return `https://ui-avatars.com/api/?name=${user?.firstName || 'U'}+${user?.lastName || 'ser'}&background=0ea5e9&color=fff&size=128`;
  };
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={onMobileOpen}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          aria-label="Toggle sidebar"
        >
          <PanelLeftClose className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive border-2 border-background" />
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="font-semibold text-sm">Notifikasi</h4>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Tidak ada notifikasi</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notif: any) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3 items-start ${!notif.read ? 'bg-muted/30' : ''}`}
                    >
                      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-primary' : 'bg-transparent'}`} />
                      <div className="flex-1 space-y-1">
                        <p className={`text-sm font-medium leading-none ${!notif.read ? 'font-semibold' : ''}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground pt-1">
                          {notif.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-2 border-t text-center">
              <Button variant="ghost" size="sm" className="w-full text-xs h-8" onClick={() => navigate('/app/notifikasi')}>
                Lihat Semua
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle compact />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={getAvatarUrl()} alt={user?.username} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {(user?.firstName?.[0] || 'U')}{(user?.lastName?.[0] || '')}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium">{user?.firstName || 'User'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(`/app/pengaturan/${userIdentifier}`)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
export default AppHeader;