import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { PageHeader, CardSkeleton } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Clock } from 'lucide-react';
import { api } from '@/lib/api';
export default function UserSchedulePage() {
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['my-schedules'],
    queryFn: async () => {
      try {
        const res = await api.get('/psb/schedules');
        return res.data;
      } catch (err) {
        console.warn('API /psb/schedules not available, using mock data');
        return [
            {
                id: 1,
                type: 'written',
                scheduledDate: new Date(Date.now() + 86400000).toISOString(),
                location: 'Gedung A, Ruang 101',
                examiner: 'Ustadz Ahmad',
                status: 'scheduled',
                notes: 'Harap membawa alat tulis lengkap'
            },
            {
                id: 2,
                type: 'quran',
                scheduledDate: new Date(Date.now() + 90000000).toISOString(),
                location: 'Masjid Utama',
                examiner: 'Ustadz Abdullah',
                status: 'scheduled',
                notes: 'Mempersiapkan hafalan Juz 30'
            }
        ];
      }
    },
  });
  if (isLoading) return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Jadwal Tes & Wawancara" 
        description="Informasi jadwal seleksi masuk pesantren" 
        icon={Calendar}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Jadwal Tes & Wawancara" 
        description="Informasi jadwal seleksi masuk pesantren" 
        icon={Calendar}
      />
      {schedules.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-muted-foreground">Belum ada jadwal tes yang ditentukan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule: any) => (
            <Card key={schedule.id} className="relative overflow-hidden border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">
                        {schedule.type === 'written' ? 'Tes Tulis' : 
                         schedule.type === 'interview' ? 'Wawancara' : 
                         schedule.type === 'quran' ? 'Tes Al-Qur\'an' : schedule.type}
                    </CardTitle>
                    <Badge variant={schedule.status === 'completed' ? 'secondary' : 'default'}>
                        {schedule.status === 'scheduled' ? 'Terjadwal' : 
                         schedule.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                    </Badge>
                </div>
                <CardDescription>
                    Tes Masuk Pesantren
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                        {format(new Date(schedule.scheduledDate), 'EEEE, dd MMMM yyyy', { locale: idLocale })}
                        <br />
                        <span className="ml-6">
                            Pukul {format(new Date(schedule.scheduledDate), 'HH:mm', { locale: idLocale })} WIB
                        </span>
                    </span>
                </div>
                <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{schedule.location}</span>
                </div>
                {schedule.examiner && (
                    <div className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Penguji: {schedule.examiner}</span>
                    </div>
                )}
                {schedule.notes && (
                    <div className="bg-muted p-3 rounded-md text-sm italic">
                        "{schedule.notes}"
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}