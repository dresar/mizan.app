import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useSantriNotifications } from '@/hooks/use-santri';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
const typeIcon: Record<string, any> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
};
const typeColor: Record<string, string> = {
  info: 'text-blue-400',
  success: 'text-primary',
  warning: 'text-yellow-500',
};
const NotifikasiPage = () => {
  const { data, isLoading } = useSantriNotifications();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    if (data) {
      setNotifications(data);
    }
  }, [data]);
  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['santri', 'notifications'] });
    }
  });
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/notifications/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['santri', 'notifications'] });
    }
  });
  const markAllRead = () => {
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    markAllReadMutation.mutate();
  };
  const unreadCount = notifications.filter(n => !n.read).length;
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-10 w-40 mb-6" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notifikasi</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">{unreadCount} belum dibaca</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-sm text-primary font-medium hover:underline">
              Tandai semua dibaca
            </button>
          )}
        </div>
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Tidak ada notifikasi baru</p>
            </div>
          ) : (
            notifications.map((notif, i) => {
              const Icon = typeIcon[notif.type] || Info;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setNotifications(n => n.map(x => x.id === notif.id ? { ...x, read: true } : x));
                    markReadMutation.mutate(notif.id);
                  }}
                  className={`glass-card p-4 cursor-pointer transition-colors ${!notif.read ? 'border-l-2 border-l-primary bg-primary/5' : ''}`}
                >
                  <div className="flex gap-3">
                    <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${typeColor[notif.type] || 'text-gray-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1.5">{notif.date}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default NotifikasiPage;