import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, XCircle, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
interface GraduationModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'lulus' | 'tidak_lulus' | 'cadangan' | 'pending';
  santriName: string;
  nisn: string;
  score?: number; 
  notes?: string;
}
export function GraduationModal({ isOpen, onClose, status, santriName, nisn, score, notes }: GraduationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (isOpen && status === 'lulus') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, status]);
  const isPassed = status === 'lulus';
  const isRejected = status === 'tidak_lulus';
  const isBackup = status === 'cadangan';
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden border-0 p-0 bg-transparent shadow-none">
        <div className="relative bg-background rounded-lg shadow-lg overflow-hidden">
            {}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-50 flex justify-center overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: -20, x: Math.random() * 100 - 50, rotate: 0 }}
                            animate={{ y: 500, rotate: 360 }}
                            transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 w-2 h-2 bg-yellow-400 rounded-full"
                            style={{ 
                                left: `${Math.random() * 100}%`,
                                backgroundColor: ['#FFD700', '#FF0000', '#00FF00', '#0000FF'][Math.floor(Math.random() * 4)] 
                            }}
                        />
                    ))}
                </div>
            )}
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`p-6 text-center text-white ${
                    isPassed ? 'bg-gradient-to-br from-green-500 to-emerald-700' :
                    isRejected ? 'bg-gradient-to-br from-red-500 to-rose-700' :
                    'bg-gradient-to-br from-yellow-500 to-orange-600'
                }`}
            >
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                    className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4"
                >
                    {isPassed ? <Trophy className="w-12 h-12 text-white" /> :
                     isRejected ? <XCircle className="w-12 h-12 text-white" /> :
                     <AlertCircle className="w-12 h-12 text-white" />}
                </motion.div>
                <DialogTitle className="text-3xl font-bold mb-2">
                    {isPassed ? 'SELAMAT!' : isRejected ? 'MOHON MAAF' : 'PENGUMUMAN'}
                </DialogTitle>
                <p className="text-white/90 font-medium text-lg">
                    {isPassed ? 'Anda Dinyatakan LULUS' : 
                     isRejected ? 'Anda Belum Berhasil' : 
                     'Status: Cadangan'}
                </p>
            </motion.div>
            <div className="p-6 bg-background">
                <div className="space-y-4 text-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Nama Peserta</p>
                        <p className="font-semibold text-lg">{santriName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Nomor Pendaftaran / NISN</p>
                        <p className="font-mono">{nisn}</p>
                    </div>
                    {score !== undefined && (
                        <div className="bg-muted/50 p-3 rounded-lg inline-block px-8">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Nilai</p>
                            <p className="text-2xl font-bold text-primary">{score}</p>
                        </div>
                    )}
                    {notes && (
                        <div className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-md">
                            {notes}
                        </div>
                    )}
                    {isPassed ? (
                        <div className="pt-4 space-y-2">
                            <p className="text-sm text-muted-foreground mb-4">
                                Silakan melakukan daftar ulang dan pembayaran melalui menu Pembayaran.
                            </p>
                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={onClose}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Lanjut ke Pembayaran
                            </Button>
                        </div>
                    ) : (
                        <div className="pt-4">
                            <Button variant="outline" className="w-full" onClick={onClose}>
                                Tutup
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}