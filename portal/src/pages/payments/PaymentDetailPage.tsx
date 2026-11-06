import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatusBadge } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, ArrowLeft, CheckCircle, XCircle, Undo2, Printer } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { PaymentStatus } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';
import { generateReceiptPdf } from '@/lib/pdf-utils';

type AdminPayment = {
  id: number | string;
  status: PaymentStatus;
  catatan?: string;
  bank_pengirim?: string;
  no_rekening_pengirim?: string;
  nama_pemilik_rekening?: string;
  rekening_tujuan?: string;
  jumlah_transfer?: number;
  bukti_transfer?: string;
  created_at?: string;
  updated_at?: string;
  verified_at?: string;
  santri_id?: number;
  verified_by_id?: number;
  santri?: { namaLengkap?: string };
  bankPengirim?: string;
  noRekeningPengirim?: string;
  namaPemilikRekening?: string;
  rekeningTujuan?: string;
  jumlahTransfer?: number;
  buktiTransfer?: string;
  createdAt?: string;
};

export default function PaymentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payment-detail', id],
    queryFn: async () => (await api.get(`/admin/payments/${id}`)).data.data as AdminPayment,
  });

  const { data: docSettings } = useQuery({
    queryKey: ['documentSettings'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/generic/documentSettings');
        const items = response.data?.data || [];
        return items[0] || {};
      } catch (e) {
        return {};
      }
    },
  });

  const handlePrintReceipt = async () => {
    if (!data) return;
    try {
        const paymentData = {
            id: data.id,
            jumlah: data.jumlah_transfer ?? data.jumlahTransfer ?? 0,
            jenisPembayaran: 'Pembayaran Pondok', // Adjust if you have type
            createdAt: data.created_at ?? data.createdAt ?? new Date().toISOString(),
            status: data.status,
        };
        const santriData = {
            namaLengkap: data.santri?.namaLengkap || 'Umum',
        };
        
        toast.info('Sedang membuat kuitansi...');
        await generateReceiptPdf(paymentData, santriData, docSettings);
        
        // Log activity
        await api.post('/admin/logs/document', {
            action: 'print_receipt',
            details: `Payment ID: ${data.id}, Santri: ${data.santri?.namaLengkap}`
        });

        toast.success('Kuitansi berhasil didownload');
    } catch (e) {
        console.error(e);
        toast.error('Gagal membuat kuitansi');
    }
  };

  const verifyMutation = useMutation({
    mutationFn: async (status: PaymentStatus) => api.put(`/payments/${id}`, { status, catatan: note }),
    onSuccess: () => {
      toast.success('Status pembayaran diperbarui');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      navigate('/admin/payments');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => api.post(`/payments/${id}/cancel`),
    onSuccess: () => {
      toast.success('Verifikasi dibatalkan');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      navigate(`/admin/payments/${id}`);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Detail Pembayaran" description="Memuat..." icon={CreditCard} />
        <Card><CardContent className="h-40" /></Card>
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Detail Pembayaran" description="Tidak ditemukan" icon={CreditCard} />
        <Button variant="outline" onClick={() => navigate('/admin/payments')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Detail Pembayaran"
        description="Lihat detail dan bukti transfer"
        icon={CreditCard}
      >
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/payments')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Button>
            {data.status === 'verified' && (
                <Button variant="default" onClick={handlePrintReceipt}>
                  <Printer className="mr-2 h-4 w-4" /> Cetak Kuitansi
                </Button>
            )}
        </div>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Santri</p>
                <p className="font-medium">{data.santri?.namaLengkap || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={data.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jumlah Transfer</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(data.jumlah_transfer ?? data.jumlahTransfer)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Upload</p>
                <p className="text-sm">{formatDateTime(data.created_at ?? data.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bank Pengirim</p>
                <p className="font-medium">{data.bank_pengirim ?? data.bankPengirim}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">No. Rekening</p>
                <code>{data.no_rekening_pengirim ?? data.noRekeningPengirim}</code>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Atas Nama</p>
                <p>{data.nama_pemilik_rekening ?? data.namaPemilikRekening}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">Bukti Transfer</p>
            {(data.bukti_transfer ?? data.buktiTransfer) ? (
              <>
                <div className="flex items-center justify-center bg-muted rounded overflow-hidden">
                  <img
                    src={(data.bukti_transfer ?? data.buktiTransfer) as string}
                    alt="Bukti transfer"
                    className="max-h-[520px] w-auto object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="text-right">
                  <Link
                    to={(data.bukti_transfer ?? data.buktiTransfer) as string}
                    target="_blank"
                    className="text-sm text-primary hover:underline"
                  >
                    Buka gambar
                  </Link>
                </div>
              </>
            ) : (
              <div className="border rounded-lg p-4 bg-muted/50 text-center text-muted-foreground">
                Bukti transfer belum diupload
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {data.status === 'pending' && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan verifikasi (opsional)"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="destructive" onClick={() => verifyMutation.mutate('rejected')} disabled={verifyMutation.isPending}>
                <XCircle className="mr-2 h-4 w-4" /> Tolak
              </Button>
              <Button onClick={() => verifyMutation.mutate('verified')} disabled={verifyMutation.isPending}>
                <CheckCircle className="mr-2 h-4 w-4" /> Verifikasi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {data.status === 'verified' && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
            <Undo2 className="mr-2 h-4 w-4" /> Batalkan Verifikasi
          </Button>
        </div>
      )}
    </div>
  );
}