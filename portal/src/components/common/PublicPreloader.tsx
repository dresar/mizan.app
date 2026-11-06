import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, CheckCircle2, Sparkles, BookOpen, GraduationCap, Building2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PublicPreloaderProps {
  onComplete: () => void;
}

export default function PublicPreloader({ onComplete }: PublicPreloaderProps) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Menyiapkan sistem...');
  const [currentIcon, setCurrentIcon] = useState<any>(Loader2);
  
  useEffect(() => {
    // Skip if already visited in this session
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      onComplete();
      return;
    }

    const resources = [
      { key: 'websiteSettings', endpoint: '/admin/generic/websiteSettings', label: 'Konfigurasi Website', icon: Sparkles },
      { key: 'programs', endpoint: '/admin/programs', label: 'Program Pendidikan', icon: BookOpen },
      { key: 'facilities', endpoint: '/admin/facilities', label: 'Fasilitas Pondok', icon: Building2 },
      { key: 'testimonials', endpoint: '/admin/testimonials', label: 'Testimoni Santri', icon: CheckCircle2 },
      { key: 'posts', endpoint: '/admin/blog/posts', label: 'Artikel & Berita', icon: BookOpen },
      { key: 'announcements', endpoint: '/admin/announcements', label: 'Pengumuman', icon: Sparkles },
      { key: 'teachers', endpoint: '/admin/teachers', label: 'Data Pengajar', icon: GraduationCap },
    ];

    const totalResources = resources.length;
    let completed = 0;

    const prefetchData = async () => {
      try {
        // Parallel fetching for maximum speed
        const fetchPromises = resources.map(async (resource) => {
          try {
            // Update UI to show we are fetching something (might be too fast to see all)
            // But good for real-time feel
            // setCurrentIcon(resource.icon); // Don't update icon in parallel loop as it causes race conditions/flicker
            
            await queryClient.prefetchQuery({
              queryKey: resource.key === 'websiteSettings' ? ['websiteSettings'] : ['generic', resource.key],
              queryFn: async () => {
                const res = await api.get(resource.endpoint);
                return res.data.data || res.data;
              },
              staleTime: 1000 * 60 * 60, // 1 hour cache
            });
          } catch (err) {
            console.warn(`Failed to prefetch ${resource.key}`, err);
          } finally {
            completed++;
            setProgress(Math.round((completed / totalResources) * 100));
            // Show last loaded item label roughly
            setLoadingText(`Memuat ${resource.label}...`);
          }
        });

        // Start minimal delay to ensure user sees the loader at least briefly (avoid flash)
        const minTimePromise = new Promise(r => setTimeout(r, 800)); // 0.8s minimum
        
        // Wait for all fetches and minimum time
        await Promise.all([Promise.all(fetchPromises), minTimePromise]);

        setLoadingText('Siap Menjelajah!');
        setProgress(100);
        
        // Short exit delay
        await new Promise(r => setTimeout(r, 200)); 
        
        sessionStorage.setItem('hasVisited', 'true');
        onComplete();
      } catch (error) {
        console.error('Preloader error:', error);
        onComplete(); // Fallback
      }
    };

    prefetchData();
  }, [queryClient, onComplete]);

  // Icon component helper
  const IconComponent = currentIcon;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl text-foreground"
    >
      <div className="w-full max-w-md px-8 flex flex-col items-center space-y-8">
        
        {/* Animated Icon Container */}
        <motion.div 
          className="relative w-24 h-24 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </motion.div>

        {/* Center Icon (Changing) */}
        <div className="absolute mt-[-6rem]">
            <motion.div
                key={loadingText}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-primary"
            >
                <Sparkles className="w-8 h-8" />
            </motion.div>
        </div>

        {/* Text & Progress */}
        <div className="w-full space-y-4 text-center">
          <motion.h2 
            key={loadingText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-medium tracking-tight"
          >
            {loadingText}
          </motion.h2>
          
          <div className="relative pt-2">
            <Progress value={progress} className="h-2 w-full bg-secondary" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground font-mono">
                <span>LOADING ASSETS</span>
                <span>{progress}%</span>
            </div>
          </div>
        </div>

        {/* Quotes or decorative text */}
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground italic absolute bottom-12"
        >
            "Menuntut ilmu adalah kewajiban bagi setiap muslim."
        </motion.p>
      </div>
    </motion.div>
  );
}
