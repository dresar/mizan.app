import { motion } from 'framer-motion';
import { CreditCard, Upload, Loader2, AlertCircle, Clock, Search, FileDown } from 'lucide-react';
import { useSantriRegistrationStatus, useBankAccounts, useSubmitPayment, useLastPayment } from '@/hooks/use-santri';
import jsPDF from 'jspdf';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState } from 'react';
import UploadField from '@/components/forms/UploadField';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
const PaymentPage = () => {
  const { data: statusData, isLoading, error, refetch } = useSantriRegistrationStatus();
  const { data: bankAccounts } = useBankAccounts();
  const submitPayment = useSubmitPayment();
  const { data: lastPayment } = useLastPayment();
  const [query, setQuery] = useState('');
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
        <p className="text-destructive font-medium mb-2">Gagal memuat data</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }
  const currentStatus = statusData?.status || 'draft';
  const paymentStatus = statusData?.paymentStatus || 'unpaid';
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
    } catch {
      toast.error('Gagal mengirim bukti pembayaran');
    }
  };
  const filteredBanks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bankAccounts || [];
    return (bankAccounts || []).filter((b: any) =>
      (b.bankName || '').toLowerCase().includes(q) ||
      (b.accountNumber || '').toLowerCase().includes(q) ||
      (b.accountHolder || '').toLowerCase().includes(q)
    );
  }, [bankAccounts, query]);
  const handleDownloadPdf = () => {
    if (!lastPayment) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Bukti Pembayaran Pendaftaran', 20, 20);
    doc.setFontSize(12);
    doc.text(`Status: ${lastPayment.status}`, 20, 35);
    doc.text(`Tanggal: ${new Date(lastPayment.created_at).toLocaleString()}`, 20, 43);
    doc.text(`Jumlah: Rp ${Number(lastPayment.jumlah_transfer).toLocaleString('id-ID')}`, 20, 51);
    doc.text(`Bank Pengirim: ${lastPayment.bank_pengirim}`, 20, 59);
    doc.text(`No. Rekening: ${lastPayment.no_rekening_pengirim}`, 20, 67);
    doc.text(`Atas Nama: ${lastPayment.nama_pemilik_rekening}`, 20, 75);
    doc.text(`Rekening Tujuan: ${lastPayment.rekening_tujuan}`, 20, 83);
    if (lastPayment.catatan) doc.text(`Catatan: ${lastPayment.catatan}`, 20, 91);
    doc.save(`bukti-pembayaran-${lastPayment.id}.pdf`);
  };
  return (
    <div className="max-w-3xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Pembayaran</h1>
          <p className="text-sm text-muted-foreground">Kirim bukti transfer biaya pendaftaran.</p>
        </div>
        {currentStatus === 'draft' && (
          <div className="glass-card p-6 mb-6 border-l-4 border-l-amber-500">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-amber-700">Belum Terdaftar</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Silakan lengkapi Form Pendaftaran terlebih dahulu sebelum melakukan pembayaran.
                </p>
                <Link to="/app/form-pendaftaran" className="inline-block mt-3 text-sm text-primary hover:underline">
                  Buka Form Pendaftaran
                </Link>
              </div>
            </div>
          </div>
        )}
        {currentStatus !== 'draft' && paymentStatus === 'unpaid' && (
          <div className="glass-card p-6 mb-6 border-l-4 border-l-yellow-500">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-500" />
              Pembayaran Biaya Pendaftaran
            </h3>
            <div className="bg-secondary/50 p-4 rounded-lg mb-6">
              <p className="text-sm font-medium mb-2">Silakan transfer biaya pendaftaran ke salah satu rekening berikut:</p>
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari bank / nomor / a.n"
                  className="flex-1 px-3 py-2 rounded-md bg-background border border-border text-sm"
                />
              </div>
              <div className="grid gap-3">
                {filteredBanks?.map((bank: any) => (
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
                {!filteredBanks?.length && <p className="text-sm text-muted-foreground italic">Belum ada data rekening bank.</p>}
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
        {paymentStatus !== 'unpaid' && lastPayment && (
          <div className="glass-card p-6 mb-6 border-l-4 border-l-emerald-500">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-emerald-700">
                  {paymentStatus === 'verified' ? 'Pembayaran Terverifikasi' : paymentStatus === 'rejected' ? 'Pembayaran Ditolak' : 'Status Pembayaran'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Jumlah Transfer</p>
                    <p className="font-medium">Rp {Number(lastPayment.jumlah_transfer).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tanggal</p>
                    <p className="font-medium">{new Date(lastPayment.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bank Pengirim</p>
                    <p className="font-medium">{lastPayment.bank_pengirim}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">No. Rekening</p>
                    <p className="font-mono">{lastPayment.no_rekening_pengirim}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-muted-foreground">Rekening Tujuan</p>
                    <p className="font-medium">{lastPayment.rekening_tujuan}</p>
                  </div>
                  {lastPayment.catatan && (
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground">Catatan</p>
                      <p>{lastPayment.catatan}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  {lastPayment.bukti_transfer && (
                    <a href={lastPayment.bukti_transfer} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                      Lihat Bukti Transfer
                    </a>
                  )}
                  <button
                    onClick={handleDownloadPdf}
                    className="text-sm text-primary hover:underline flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Unduh Bukti (PDF)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
export default PaymentPage;