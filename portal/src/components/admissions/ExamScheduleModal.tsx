import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
interface ExamSchedule {
  id: number;
  type: string;
  scheduledDate: string;
  location: string;
  examiner?: string;
  status: string;
  notes?: string;
}
interface ExamScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: ExamSchedule[];
}
export function ExamScheduleModal({ isOpen, onClose, schedules }: ExamScheduleModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Jadwal Ujian & Wawancara
          </DialogTitle>
          <DialogDescription>
            Berikut adalah jadwal tes yang harus Anda ikuti. Harap hadir tepat waktu.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
              <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Belum ada jadwal ujian yang ditentukan.</p>
            </div>
          ) : (
            schedules.map((schedule, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-card relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    schedule.status === 'completed' ? 'bg-green-500' : 
                    schedule.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div className="pl-3">
                    <h4 className="font-semibold text-lg mb-1 capitalize">
                        {schedule.type === 'written' ? 'Tes Tulis' : 
                         schedule.type === 'interview' ? 'Wawancara' : 
                         schedule.type === 'quran' ? 'Tes Al-Qur\'an' : schedule.type}
                    </h4>
                    <div className="space-y-2 mt-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>
                                {format(new Date(schedule.scheduledDate), 'EEEE, dd MMMM yyyy - HH:mm', { locale: idLocale })} WIB
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{schedule.location}</span>
                        </div>
                        {schedule.examiner && (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>Penguji: {schedule.examiner}</span>
                            </div>
                        )}
                    </div>
                    {schedule.notes && (
                        <div className="mt-3 p-2 bg-muted rounded text-xs italic">
                            Catatan: {schedule.notes}
                        </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}