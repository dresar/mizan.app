
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { useSyncStore } from '@/stores/sync-store';
import { SYNC_RESOURCES, CACHE_EXPIRATION_TIME } from '@/lib/sync-config';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function DataSyncPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { 
    progress, 
    currentStep, 
    isSyncing, 
    lastSynced,
    setSyncing, 
    setProgress, 
    setStep, 
    setTotalSteps,
    setLastSynced,
    addError,
    errors
  } = useSyncStore();

  const startSync = async (force = false) => {
    if (!force && lastSynced && (Date.now() - lastSynced < CACHE_EXPIRATION_TIME)) {
      navigate('/admin-cms/dashboard', { replace: true });
      return;
    }

    setSyncing(true);
    setTotalSteps(SYNC_RESOURCES.length);
    setProgress(0);

    try {
      let completed = 0;
      
      // Step 1: Sequential or Batched Fetching
      // We process critical items first, then others
      
      for (const resource of SYNC_RESOURCES) {
        setStep(resource.label);
        
        try {
          // Fetch data using the API directly or prefetchQuery
          // prefetchQuery is better as it populates the cache
          await queryClient.prefetchQuery({
            queryKey: [resource.key],
            queryFn: async () => {
              const res = await api.get(resource.endpoint);
              return res.data;
            },
            staleTime: CACHE_EXPIRATION_TIME, // Consider fresh for 24h
          });
          
        } catch (err: any) {
          console.error(`Failed to sync ${resource.key}`, err);
          // Don't block the whole process, but log error
          addError(`Gagal memuat ${resource.label}`);
        }
        
        completed++;
        setProgress((completed / SYNC_RESOURCES.length) * 100);
        
        // Artificial delay for UX (so the user sees the progress bar moving)
        // Remove in production if speed is critical, but helpful for "feeling" of work
        await new Promise(r => setTimeout(r, 100)); 
      }

      setLastSynced(Date.now());
      toast.success('Sinkronisasi data berhasil!');
      setTimeout(() => {
        navigate('/admin-cms/dashboard', { replace: true });
      }, 500);

    } catch (error) {
      console.error('Sync failed', error);
      toast.error('Terjadi kesalahan saat sinkronisasi data.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    startSync();
  }, []);

  const handleRetry = () => {
    startSync(true);
  };

  const handleSkip = () => {
    navigate('/admin-cms/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-md space-y-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg shadow-primary/20">
            <Database className="w-10 h-10 text-white" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Menyiapkan Data</h1>
          <p className="text-slate-400">
            {isSyncing 
              ? `Sedang mengunduh ${currentStep}...` 
              : errors.length > 0 
                ? 'Sinkronisasi selesai dengan beberapa peringatan' 
                : 'Data siap!'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/20">
                {isSyncing ? 'Syncing' : 'Complete'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-primary">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-700">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
            ></motion.div>
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-2 min-h-[60px]">
           <AnimatePresence>
             {errors.length > 0 && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex items-center justify-center gap-2 text-yellow-400 text-sm bg-yellow-400/10 p-2 rounded-lg"
               >
                 <AlertCircle className="w-4 h-4" />
                 <span>{errors.length} data gagal dimuat, namun Anda tetap bisa melanjutkan.</span>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Actions */}
        {!isSyncing && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }}
             className="flex gap-4 justify-center"
           >
             <button 
               onClick={handleRetry}
               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors"
             >
               <RefreshCw className="w-4 h-4" />
               Coba Lagi
             </button>
             <button 
               onClick={handleSkip}
               className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-sm font-medium transition-colors"
             >
               Lanjut ke Dashboard
               <CheckCircle2 className="w-4 h-4" />
             </button>
           </motion.div>
        )}
      </motion.div>
      
      <div className="absolute bottom-8 text-xs text-slate-500">
        PesantrenHub &copy; {new Date().getFullYear()} • Secure Data Synchronization
      </div>
    </div>
  );
}
