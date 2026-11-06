import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePublicData } from '@/hooks/use-public-data';

interface Announcement {
  id: number;
  judul: string;
  konten: string;
  slug: string;
  gambar?: string;
  popupImage?: string;
  popupEnabled: boolean;
  isPenting: boolean;
}

const AnnouncementPopup = () => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<Announcement | null>(null);

  const { data: announcements = [] } = usePublicData<Announcement[]>(
    ['popup-announcements'],
    '/blog/announcements?popup=true'
  );

  useEffect(() => {
    if (announcements.length === 0) return;
    const popupAnnouncements = announcements.filter(a => a.popupEnabled);
    if (popupAnnouncements.length === 0) return;

    // Check which ones haven't been seen this session
    const seenIds = JSON.parse(sessionStorage.getItem('seenPopups') || '[]');
    const unseen = popupAnnouncements.filter(a => !seenIds.includes(a.id));
    if (unseen.length === 0) return;

    // Show the first unseen popup after 1.5s
    const timer = setTimeout(() => {
      setCurrent(unseen[0]);
      setVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [announcements]);

  const dismiss = () => {
    setVisible(false);
    if (current) {
      const seenIds = JSON.parse(sessionStorage.getItem('seenPopups') || '[]');
      sessionStorage.setItem('seenPopups', JSON.stringify([...seenIds, current.id]));
    }
  };

  return (
    <AnimatePresence>
      {visible && current && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Popup Modal */}
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative gradient-primary p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-white uppercase tracking-wider">
                  {current.isPenting ? '🔴 Pengumuman Penting' : '📢 Pengumuman'}
                </span>
                <button
                  onClick={dismiss}
                  className="ml-auto w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Tutup popup"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Image (optional) */}
              {(current.popupImage || current.gambar) && (
                <div className="w-full aspect-video overflow-hidden bg-muted">
                  <img
                    src={current.popupImage || current.gambar}
                    alt={current.judul}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                <h2 className="text-lg font-bold mb-2 leading-snug">{current.judul}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  {current.konten}
                </p>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5 flex items-center justify-between gap-3">
                <Link
                  to={`/pengumuman/${current.slug}`}
                  onClick={dismiss}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  Baca Selengkapnya <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={dismiss}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementPopup;
