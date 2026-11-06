import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import AiAssistantButton from '@/components/shared/AiAssistantButton';
import BugNoteButton from '@/components/shared/BugNoteButton';
import { useSyncStore } from '@/stores/sync-store';
import { CACHE_EXPIRATION_TIME } from '@/lib/sync-config';
import { useAdminPrefetch } from '@/hooks/use-admin-prefetch';

export function AdminLayout() {
  useAdminPrefetch();
  const { sidebarCollapsed } = useAppStore();
  const navigate = useNavigate();
  const { lastSynced } = useSyncStore();

  // Background Sync Check
  useEffect(() => {
    if (!lastSynced || (Date.now() - lastSynced > CACHE_EXPIRATION_TIME)) {
      // Optional: Silent background sync logic here
    }
  }, [lastSynced, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div
        className={cn(
          'transition-all duration-300 min-h-screen',
          'lg:pl-72', 
          sidebarCollapsed && 'lg:pl-16',
          'pl-0' 
        )}
      >
        <AppTopbar />
        <main className="min-h-[calc(100vh-4rem)] pt-16">
          <div className="container py-8 lg:py-10 max-w-7xl mx-auto px-6 lg:px-10">
            <Outlet />
          </div>
        </main>
        <BugNoteButton />
        <AiAssistantButton />
        <WhatsAppButton role="admin" />
      </div>
    </div>
  );
}
