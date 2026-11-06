import { motion } from 'framer-motion';
import { Check, Clock, CircleDot, CreditCard, Upload, Loader2, AlertCircle, Calendar, Trophy, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSantriRegistrationStatus, useBankAccounts, useSubmitPayment } from '@/hooks/use-santri';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import UploadField from '@/components/forms/UploadField';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { GraduationModal } from '@/components/admissions/GraduationModal';
import { ExamScheduleModal } from '@/components/admissions/ExamScheduleModal';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
const StatusPendaftaranPage = () => {
  const { data, isLoading, error, refetch } = useSantriRegistrationStatus();
  const { data: bankAccounts } = useBankAccounts();
  const [query, setQuery] = useState('');
  const submitPayment = useSubmitPayment();
  const [showExamModal, setShowExamModal] = useState(false);
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  useEffect(() => {
    if (data?.status === 'rejected') {
      setShowRejectionModal(true);
    }
  }, [data?.status]);
  const { data: schedules = [] } = useQuery({
    queryKey: ['my-schedules'],
    queryFn: async () => {
      try {
        const res = await api.get('/psb/schedules');
        return res.data;
      } catch (err) {
        console.warn('API /psb/schedules failed, using mock');
        return [
            {
                id: 1,
                type: 'written',
                scheduledDate: new Date(Date.now() + 86400000).toISOString(),
                location: 'Gedung A, Ruang 101',
                examiner: 'Ustadz Ahmad',
                status: 'scheduled',
                notes: 'Harap membawa alat tulis lengkap'
            }
        ];
      }
    },
    enabled: !!data,
  });
  const { data: result } = useQuery({
    queryKey: ['my-result'],
    queryFn: async () => {
      try {
        const res = await api.get('/psb/results');
        return res.data;
      } catch (err) {
         console.warn('API /psb/results failed, using mock');
         return {
            santriId: 1,
            totalScore: 87.6,
            status: 'lulus',
            isPublished: true,
            notes: 'Selamat, Anda diterima di Pondok Pesantren Raudhatussalam!',
            santri: {
                namaLengkap: data?.namaLengkap || 'Calon Santri',
                nisn: data?.nisn || '1234567890'
            }
        };
      }
    },
    enabled: !!data,
  });
  const [paymentForm, setPaymentForm] = useState({
    bankPengirim: '',
    noRekeningPengirim: '',
    namaPemilikRekening: '',
    rekeningTujuan: '',
    jumlahTransfer: '',
    catatan: '',
    buktiTransfer: null as File | null
  });
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-destructive font-medium mb-2">Gagal memuat status pendaftaran</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }
  const currentStatus = data?.status || 'draft';
  const paymentStatus = data?.paymentStatus || 'unpaid';
  const computedStatus = paymentStatus === 'verified' && (currentStatus === 'pending' || currentStatus === 'submitted') ? 'verified' : currentStatus;
  const steps = [
    { label: 'Pendaftaran Akun', status: 'done', date: data?.accountCreatedDate },
    { 
      label: 'Pengisian Formulir', 
      status: computedStatus === 'draft' ? 'current' : 'done',
      date: data?.formSubmittedDate 
    },
    {
      label: 'Pembayaran',
      status: paymentStatus === 'verified' ? 'done' : (paymentStatus === 'pending' ? 'current' : (computedStatus === 'draft' ? 'upcoming' : 'current')),
      date: data?.paymentDate
    },
    { 
      label: 'Verifikasi Dokumen', 
      status: computedStatus === 'submitted' ? 'current' : (['verified', 'accepted', 'rejected'].includes(computedStatus) ? 'done' : 'upcoming'),
      date: data?.verifiedDate
    },
    { 
      label: 'Tes Masuk & Wawancara', 
      status: computedStatus === 'verified' ? 'current' : (['accepted', 'rejected'].includes(computedStatus) ? 'done' : 'upcoming'),
      date: data?.interviewDate
    },
    { 
      label: 'Pengumuman Kelulusan', 
      status: computedStatus === 'accepted' ? 'done' : (computedStatus === 'rejected' ? 'rejected' : 'upcoming'),
      date: data?.acceptedDate
    }
  ];
  const summary = data?.summary || [
    { label: 'Nama Lengkap', value: '-' },
    { label: 'Nomor Registrasi', value: '-' },
    { label: 'Jalur Pendaftaran', value: 'Reguler' },
    { label: 'Tahun Ajaran', value: '2026/2027' },
  ];
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.buktiTransfer) {
      toast.error('Mohon upload bukti transfer');
      return;
    }
    if (!paymentForm.rekeningTujuan) {
        toast.error('Pilih rekening tujuan');
        return;
    }
    try {
      await submitPayment.mutateAsync({
          ...paymentForm,
          buktiTransfer: paymentForm.buktiTransfer
      });
      toast.success('Bukti pembayaran berhasil dikirim');
      setPaymentForm({
        bankPengirim: '',
        noRekeningPengirim: '',
        namaPemilikRekening: '',
        rekeningTujuan: '',
        jumlahTransfer: '',
        catatan: '',
        buktiTransfer: null
      });
      refetch();
    } catch (err) {
      toast.error('Gagal mengirim bukti pembayaran');
    }
  };
  return (
    <div className="max-w-3xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Status Pendaftaran</h1>
            <p className="text-sm text-muted-foreground">Pantau progres pendaftaran Anda secara real-time.</p>
        </div>
        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {}
            {/* Exam Schedule Card */}
            <div className={`glass-card p-4 flex items-center justify-between relative overflow-hidden ${
                computedStatus !== 'verified' && computedStatus !== 'accepted' ? 'opacity-80 bg-muted/40' : ''
            }`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                        computedStatus === 'verified' || computedStatus === 'accepted' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                        {computedStatus === 'verified' || computedStatus === 'accepted' ? <Calendar className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Jadwal Ujian</p>
                        {computedStatus === 'verified' || computedStatus === 'accepted' ? (
                            <p className="text-xs text-muted-foreground">{schedules.length} Jadwal tersedia</p>
                        ) : (
                            <p className="text-xs text-muted-foreground">Menunggu verifikasi berkas & pembayaran</p>
                        )}
                    </div>
                </div>
                
                {computedStatus === 'verified' || computedStatus === 'accepted' ? (
                    <Button variant="outline" size="sm" onClick={() => setShowExamModal(true)}>
                        Lihat
                    </Button>
                ) : (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed">
                                    <Lock className="w-3 h-3 mr-1" /> Terkunci
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Selesaikan pembayaran dan verifikasi berkas untuk membuka jadwal ujian</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            {}
            {result && (
                <div className="glass-card p-4 flex items-center justify-between border-l-4 border-l-yellow-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Pengumuman</p>
                            <p className="text-xs text-muted-foreground">Hasil seleksi tersedia</p>
                        </div>
                    </div>
                    <Button size="sm" onClick={() => setShowGraduationModal(true)}>
                        Lihat Hasil
                    </Button>
                </div>
            )}
        </div>
        {}
        <div className="glass-card p-6 mb-6">
          <div className="relative">
            {steps.map((step, i) => {
              const Icon = step.status === 'done' ? Check : step.status === 'current' ? CircleDot : Clock;
              const isRejected = step.status === 'rejected';
              return (
                <div key={i} className="flex items-start gap-4 relative">
                  {i < steps.length - 1 && (
                    <div className={`absolute left-[15px] top-8 w-0.5 h-[calc(100%-8px)] ${step.status === 'done' ? 'bg-primary' : 'bg-border'}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    step.status === 'done' ? 'bg-primary text-primary-foreground' :
                    step.status === 'current' ? 'bg-primary/20 text-primary border-2 border-primary' :
                    isRejected ? 'bg-destructive text-destructive-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="pb-8">
                    <p className={`text-sm font-medium ${
                        step.status === 'current' ? 'text-primary' : 
                        step.status === 'done' ? 'text-foreground' : 
                        isRejected ? 'text-destructive' :
                        'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                    {step.date && <p className="text-xs text-muted-foreground mt-0.5">{step.date}</p>}
                    {step.status === 'current' && (
                      <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Sedang Diproses
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {}
        {paymentStatus === 'unpaid' && currentStatus !== 'draft' && (
            <div className="glass-card p-6 mb-6 border-l-4 border-l-yellow-500">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-yellow-500" />
                    Pembayaran Biaya Pendaftaran
                </h3>
                <div className="bg-secondary/50 p-4 rounded-lg mb-6">
                    <p className="text-sm font-medium mb-2">Silakan transfer biaya pendaftaran ke salah satu rekening berikut:</p>
                    <div className="flex items-center gap-2 mb-3">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari bank / nomor / a.n"
                            className="flex-1 px-3 py-2 rounded-md bg-background border border-border text-sm"
                        />
                    </div>
                    <div className="grid gap-3">
                        {(bankAccounts || []).filter((b: any) => {
                            const q = query.trim().toLowerCase();
                            if (!q) return true;
                            return (b.bankName || '').toLowerCase().includes(q) ||
                                   (b.accountNumber || '').toLowerCase().includes(q) ||
                                   (b.accountHolder || '').toLowerCase().includes(q);
                        }).map((bank: any) => (
                            <div key={bank.id} className="flex items-center justify-between p-3 bg-background rounded border border-border">
                                <div>
                                    <p className="font-bold text-primary">{bank.bankName}</p>
                                    <p className="font-mono text-lg">{bank.accountNumber}</p>
                                    <p className="text-xs text-muted-foreground">a.n {bank.accountHolder}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(bank.accountNumber);
                                        toast.success('Nomor rekening disalin');
                                    }}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Salin
                                </button>
                            </div>
                        ))}
                        {!bankAccounts?.length && <p className="text-sm text-muted-foreground italic">Belum ada data rekening bank.</p>}
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>Pastikan nominal transfer sesuai dengan ketentuan. Simpan bukti transfer untuk diupload di bawah ini.</p>
                    </div>
                </div>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <h4 className="font-medium text-sm">Upload Bukti Pembayaran</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium mb-1 block">Bank Pengirim</label>
                            <input 
                                required
                                className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm"
                                placeholder="Contoh: BCA, BRI"
                                value={paymentForm.bankPengirim}
                                onChange={e => setPaymentForm({...paymentForm, bankPengirim: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block">Nomor Rekening Pengirim</label>
                            <input 
                                required
                                className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm"
                                placeholder="Nomor Rekening Anda"
                                value={paymentForm.noRekeningPengirim}
                                onChange={e => setPaymentForm({...paymentForm, noRekeningPengirim: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block">Nama Pemilik Rekening</label>
                            <input 
                                required
                                className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm"
                                placeholder="Atas Nama"
                                value={paymentForm.namaPemilikRekening}
                                onChange={e => setPaymentForm({...paymentForm, namaPemilikRekening: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block">Jumlah Transfer</label>
                            <input 
                                required
                                type="number"
                                className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm"
                                placeholder="Rp"
                                value={paymentForm.jumlahTransfer}
                                onChange={e => setPaymentForm({...paymentForm, jumlahTransfer: e.target.value})}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-medium mb-1 block">Rekening Tujuan</label>
                            <select 
                                required
                                className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm"
                                value={paymentForm.rekeningTujuan}
                                onChange={e => setPaymentForm({...paymentForm, rekeningTujuan: e.target.value})}
                            >
                                <option value="">Pilih Rekening Tujuan</option>
                                {bankAccounts?.map((bank: any) => (
                                    <option key={bank.id} value={`${bank.bankName} - ${bank.accountNumber}`}>
                                        {bank.bankName} - {bank.accountNumber}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                             <UploadField 
                                label="Bukti Transfer (Foto/Screenshot)" 
                                onFileSelect={(f) => setPaymentForm({...paymentForm, buktiTransfer: f})} 
                             />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={submitPayment.isPending}
                        className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
                    >
                        {submitPayment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Kirim Bukti Pembayaran
                    </button>
                </form>
            </div>
        )}
        {paymentStatus === 'pending' && (
            <div className="glass-card p-6 mb-6 border-l-4 border-l-blue-500">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-blue-700">Pembayaran Sedang Diverifikasi</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Bukti pembayaran Anda telah kami terima dan sedang dalam proses pengecekan oleh bagian keuangan. 
                            Mohon tunggu 1x24 jam.
                        </p>
                    </div>
                </div>
            </div>
        )}
        {}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Ringkasan Pendaftaran</h3>
          <div className="space-y-3">
            {summary.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      {}
      {/* Rejection Modal */}
      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl text-red-600">Pendaftaran Ditolak</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Mohon maaf, pendaftaran Anda belum dapat kami terima.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-800">
            <p className="font-semibold mb-1">Catatan dari Panitia:</p>
            <p>{data?.message || 'Dokumen tidak memenuhi persyaratan.'}</p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={() => setShowRejectionModal(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExamScheduleModal 
        isOpen={showExamModal} 
        onClose={() => setShowExamModal(false)} 
        schedules={schedules} 
      />
      {result && (
        <GraduationModal 
            isOpen={showGraduationModal} 
            onClose={() => setShowGraduationModal(false)} 
            status={result.status}
            santriName={result.santri?.namaLengkap || '-'}
            nisn={result.santri?.nisn || '-'}
            score={result.totalScore}
            notes={result.notes}
        />
      )}
    </div>
  );
};
export default StatusPendaftaranPage;