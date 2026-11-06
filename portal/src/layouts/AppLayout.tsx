import { ReactNode, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AppHeader from '@/components/app/AppHeader';
import AppSidebar from '@/components/app/AppSidebar';
import { Link } from 'react-router-dom';
import { Home, ClipboardList, Clock, CreditCard, Calendar, Bell, Settings, LayoutDashboard, FileEdit, Users, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSantriRegistrationStatus } from '@/hooks/use-santri';
import { RegistrationSuccessModal } from '@/components/admissions/RegistrationSuccessModal';

interface AppLayoutProps {
  children: ReactNode;
}
const AppLayout = ({ children }: AppLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();
  const userIdentifier = (user as any)?.username || user?.id || '';
  const isAuthor = user?.role === 'author' || (user as any)?.publicationStatus !== 'none';
  
  const { data: userDetails } = useQuery({
    queryKey: ['me-details'],
    queryFn: async () => {
        const res = await api.get('/users/me');
        return res.data.user;
    },
    enabled: !!user,
    refetchOnWindowFocus: true
  });

  const { data: santriStatus } = useSantriRegistrationStatus();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (userDetails && santriStatus) {
        // Trigger if verified/accepted AND not seen yet
        const isVerified = ['verified', 'accepted'].includes(santriStatus.status);
        if (isVerified && userDetails.isNotificationSeen === false) {
            setShowSuccessModal(true);
        }
    }
  }, [userDetails, santriStatus]);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <RegistrationSuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        santriName={santriStatus?.namaLengkap || userDetails?.firstName || 'Santri'}
      />
      {}
      <div className="hidden lg:block shrink-0">
        <AppSidebar collapsed={collapsed} />
      </div>
      {}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <AppSidebar collapsed={false} onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          sidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
          onMobileOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24">
          {children}
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background lg:hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
              {isAuthor ? (
                <>
                  <Link
                    to="/author/dashboard"
                    title="Dashboard"
                    className="flex items-center justify-center w-12 h-12 rounded-[4px] min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="h-6 w-6" />
                  </Link>
                  <Link
                    to="/author/articles"
                    title="Artikel"
                    className="flex items-center justify-center w-12 h-12 rounded-[4px] min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <FileEdit className="h-6 w-6" />
                  </Link>
                  <Link
                    to="/author/collaborations"
                    title="Kolaborasi"
                    className="flex items-center justify-center px-4 h-12 rounded-[4px] min-h-[44px] bg-primary text-primary-foreground font-medium"
                  >
                    <Users className="h-6 w-6" />
                  </Link>
                  <Link
                    to="/author/discussions"
                    title="Diskusi"
                    className="flex items-center justify-center w-12 h-12 rounded-[4px] min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <MessageSquare className="h-6 w-6" />
                  </Link>
                  <Link
                    to="/author/profile"
                    title="Profil"
                    className="flex items-center justify-center w-12 h-12 rounded-[4px] min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="h-6 w-6" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={`/santri/dashboard/${userIdentifier}`}
                    title="Dashboard"
                    className="flex items-center justify-center w-12 h-12 rounded-[4px] min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Home className="h-6 w-6" />
                  </Link>
                  <Link
                    to={`/app/form-pendaftaran/${userIdentifier}`}
                    title="Form"
                    className="flex items-center justify-center w-12 h-12 rounded-[4px] min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <ClipboardList className="h-6 w-6" />
                  </Link>
                  <Link
                    to={`/app/status/${userIdentifier}`}
                    title="Status"
                    className="flex items-center justify-center px-4 h-12 rounded-[4px] min-h-[44px] bg-primary text-primary-foreground font-medium"
                  >
                    <Clock className="h-6 w-6" />
                  </Link>
                  <Link
                    to={`/app/pembayaran/${userIdentifier}`}
                    title="Pembayaran"
                    className="flex items-center justify-center w-12 h-12 rounded-[4px] min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <CreditCard className="h-6 w-6" />
                  </Link>
                  <Link
                    to={`/app/notifikasi/${userIdentifier}`}
                    title="Notifikasi"
                    className="flex items-center justify-center w-12 h-12 rounded-[4px] min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Bell className="h-6 w-6" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <WhatsAppButton className="bottom-24 right-4" role="user" />
    </div>
  );
};
export default AppLayout;
