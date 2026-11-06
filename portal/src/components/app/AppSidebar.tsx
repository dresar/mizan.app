import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, BookOpen, Calendar, Bell, Settings, LogOut, ClipboardList, CreditCard, LayoutDashboard, FileEdit, Users, Upload, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { usePublicData } from '@/hooks/use-public-data';
import { Logo } from '@/components/shared/Logo';

interface AppSidebarProps {
  collapsed: boolean;
  onClose?: () => void;
}

const AppSidebar = ({ collapsed, onClose }: AppSidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { data: settings } = usePublicData<any>(['settings'], '/core/settings');
  const userIdentifier = (user as any)?.username || user?.id || '';

  // Determine role-based menu items
  const isAuthor = user?.role === 'author' || (user as any)?.publicationStatus !== 'none';

  const menuItems = isAuthor ? [
    { icon: LayoutDashboard, label: 'Dashboard Penulis', href: '/author/dashboard' },
    { icon: FileEdit, label: 'Artikel Saya', href: '/author/articles' },
    { icon: Upload, label: 'Upload Jurnal', href: '/author/journals' }, // Future feature
    { icon: Users, label: 'Kolaborasi', href: '/author/collaborations' }, // Future feature
    { icon: MessageSquare, label: 'Diskusi & Review', href: '/author/discussions' }, // Future feature
    { icon: Settings, label: 'Profil Publikasi', href: '/author/profile' },
  ] : [
    { icon: Home, label: 'Dashboard', href: `/santri/dashboard/${userIdentifier}` },
    { icon: ClipboardList, label: 'Form Pendaftaran', href: `/app/form-pendaftaran/${userIdentifier}` },
    { icon: FileText, label: 'Status Pendaftaran', href: `/app/status/${userIdentifier}` },
    { icon: CreditCard, label: 'Pembayaran', href: `/app/pembayaran/${userIdentifier}` },
    { icon: BookOpen, label: 'Jadwal Pelajaran', href: `/app/jadwal/${userIdentifier}` },
    { icon: Calendar, label: 'Jadwal Ujian', href: `/app/jadwal-ujian/${userIdentifier}` },
    { icon: Bell, label: 'Notifikasi', href: `/app/notifikasi/${userIdentifier}` },
    { icon: Settings, label: 'Pengaturan', href: `/app/pengaturan/${userIdentifier}` },
  ];

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };
  return (
    <aside
      className={cn(
        'h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border shrink-0">
        <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
          <Logo variant="icon" iconClassName="w-8 h-8 rounded-md shrink-0" />
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground whitespace-nowrap">
              Raudhatussalam
            </span>
          )}
        </Link>
      </div>
      {}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[4px] min-h-[44px] text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      {}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[4px] min-h-[44px] text-sm font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
};
export default AppSidebar;
