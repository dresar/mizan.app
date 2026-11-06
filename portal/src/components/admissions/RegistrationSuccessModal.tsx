import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  santriName: string;
}

export function RegistrationSuccessModal({ isOpen, onClose, santriName }: RegistrationSuccessModalProps) {
  const { width, height } = useWindowSize();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const navigate = useNavigate();

  const handleClose = async () => {
    if (dontShowAgain) {
      try {
        await api.put('/users/me/notification-seen');
      } catch (err) {
        console.error('Failed to update notification seen status', err);
      }
    }
    onClose();
  };

  // Sound effect
  useEffect(() => {
    if (isOpen) {
      const audio = new Audio('/sounds/success.mp3');
      audio.play().catch(e => console.log('Audio play failed', e));
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md text-center overflow-hidden border-0 bg-transparent shadow-none p-0">
         <div className="bg-background rounded-lg border shadow-lg p-6 relative overflow-hidden">
            {isOpen && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
            
            <div className="flex flex-col items-center justify-center space-y-4 pt-4 relative z-10">
                <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2"
                >
                    <Trophy className="w-10 h-10" />
                </motion.div>
                
                <DialogTitle className="text-2xl font-bold text-green-700">Selamat!</DialogTitle>
                
                <DialogDescription className="text-base text-center text-muted-foreground">
                    Pendaftaran santri atas nama <span className="font-semibold text-foreground">{santriName}</span> telah <span className="font-bold text-green-600">DISETUJUI</span>.
                </DialogDescription>
                
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-800 mt-2">
                    Silakan cek menu <strong>Jadwal Ujian</strong> untuk melihat jadwal tes masuk Anda.
                </div>

                <div className="flex items-center space-x-2 mt-4">
                    <Checkbox 
                        id="dontShow" 
                        checked={dontShowAgain} 
                        onCheckedChange={(checked) => setDontShowAgain(checked as boolean)} 
                    />
                    <label 
                        htmlFor="dontShow" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                        Jangan tampilkan lagi
                    </label>
                </div>
            </div>
            
            <div className="mt-6 flex justify-center w-full relative z-10">
                <Button onClick={handleClose} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Mengerti, Lanjutkan
                </Button>
            </div>
         </div>
      </DialogContent>
    </Dialog>
  );
}
