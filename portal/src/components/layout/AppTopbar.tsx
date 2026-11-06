import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Bell, Menu, Moon, Search, Settings, Sun, User, LogOut, Monitor, ChevronDown, Check, Info, AlertTriangle, XCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import AdminThemeToggle from '@/components/shared/AdminThemeToggle';
import { MediaLibraryModal } from '@/components/media/MediaLibraryModal';
import { useState, useEffect } from 'react';

export function AppTopbar() {
  const navigate = useNavigate();
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const { theme, setTheme } = useTheme();
  const { sidebarCollapsed, setSidebarOpen, globalSearch, setGlobalSearch, showConfirm } = useAppStore();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: notificationData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications'); 
      return res.data;
    },
    refetchInterval: 300000 // 5 minutes
  });
  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/notifications/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
  const notifications = notificationData?.data || [];
  const unreadCount = notificationData?.unreadCount || 0;
  const handleLogout = () => {
    showConfirm({
      title: 'Keluar',
      description: 'Apakah Anda yakin ingin keluar dari sistem?',
      variant: 'destructive',
      onConfirm: () => {
        logout();
        toast.success('Anda telah keluar');
        navigate('/login');
      }
    });
  };
  const userInitials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : 'U';

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-72',
        'lg:left-16 lg:data-[collapsed=false]:left-72',
        'left-0'
      )}
      data-collapsed={sidebarCollapsed}
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {}
        <div className="flex items-center gap-4">
          {}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden -ml-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        {}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowMediaLibrary(true)}>
            <ImageIcon className="h-5 w-5" />
          </Button>
          <MediaLibraryModal open={showMediaLibrary} onOpenChange={setShowMediaLibrary} />
          <AdminThemeToggle />
          {}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
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
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-auto p-0 text-primary hover:text-primary/80"
                    onClick={() => markAllReadMutation.mutate()}
                  >
                    Tandai semua dibaca
                  </Button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Tidak ada notifikasi</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {}
                    {notifications.map((notif: any) => (
                      <div 
                        key={notif.id} 
                        className={cn(
                          "p-4 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3 items-start",
                          !notif.isRead && "bg-muted/30"
                        )}
                        onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
                      >
                        <div className={cn(
                          "mt-1 h-2 w-2 rounded-full flex-shrink-0",
                          !notif.isRead ? "bg-primary" : "bg-transparent"
                        )} />
                        <div className="flex-1 space-y-1">
                          <p className={cn("text-sm font-medium leading-none", !notif.isRead && "font-semibold")}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground pt-1">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: idLocale })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-2 border-t text-center">
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="w-full text-xs h-8"
                   onClick={() => navigate('/app/notifikasi')}
                 >
                   Lihat Semua
                 </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.username} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">{user?.first_name || 'User'}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user?.role || 'Guest'}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin-cms/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profil Saya
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin-cms/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <MediaLibraryModal 
        open={showMediaLibrary} 
        onOpenChange={setShowMediaLibrary} 
        mode="manage" 
      />
    </header>
  );
}
