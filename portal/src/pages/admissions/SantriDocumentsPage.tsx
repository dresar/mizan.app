import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader, DataTable } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import {
  FileCheck,
  FileX,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
type DocType = 'foto_santri' | 'foto_ktp' | 'foto_akta' | 'foto_ijazah' | 'surat_sehat' | 'foto_kk';
interface SelectedDoc {
  santriId: string;
  santriName: string;
  type: DocType;
  label: string;
  url: string;
  approved: boolean;
}
export default function SantriDocumentsPage() {
  const [selectedDoc, setSelectedDoc] = useState<SelectedDoc | null>(null);
  const { data: santriData, isLoading, refetch } = useQuery({
    queryKey: ['santri-docs'],
    queryFn: async () => {
      const response = await api.get('/admin/santri', { params: { limit: 1000 } });
      const list: unknown[] = response.data.data || [];
      return list.map((raw: any) => ({
        id: raw.id,
        nama_lengkap: raw.namaLengkap || raw.nama_lengkap,
        nisn: raw.nisn,
        foto_santri: raw.fotoSantri || raw.foto_santri,
        foto_ktp: raw.fotoKtp || raw.foto_ktp,
        foto_akta: raw.fotoAkta || raw.foto_akta,
        foto_ijazah: raw.fotoIjazah || raw.foto_ijazah,
        surat_sehat: raw.suratSehat || raw.surat_sehat,
        foto_kk: raw.fotoKk || raw.foto_kk,
        foto_santri_approved: raw.fotoSantriApproved ?? raw.foto_santri_approved ?? false,
        foto_ktp_approved: raw.fotoKtpApproved ?? raw.foto_ktp_approved ?? false,
        foto_akta_approved: raw.fotoAktaApproved ?? raw.foto_akta_approved ?? false,
        foto_ijazah_approved: raw.fotoIjazahApproved ?? raw.foto_ijazah_approved ?? false,
        surat_sehat_approved: raw.suratSehatApproved ?? raw.surat_sehat_approved ?? false,
        foto_kk_approved: raw.fotoKkApproved ?? raw.foto_kk_approved ?? false,
      }));
    },
  });
  const handleVerifyDoc = async (approved: boolean) => {
    if (!selectedDoc) return;
    try {
      const payload: Record<string, boolean> = {};
      const fieldName = selectedDoc.type === 'foto_kk' ? 'fotoKkApproved' : 
                        selectedDoc.type.replace(/_([a-z])/g, (g) => g[1].toUpperCase()) + 'Approved'; 
      payload[fieldName] = approved;
      await api.put(`/admin/santri/${selectedDoc.santriId}`, payload);
      toast.success(`Dokumen ${approved ? 'disetujui' : 'ditolak'}`);
      await refetch();
      setSelectedDoc(null);
    } catch (error) {
      toast.error('Gagal memverifikasi dokumen');
    }
  };
  const handleDownload = async () => {
    if (!selectedDoc?.url) return;
    try {
      const response = await fetch(selectedDoc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDoc.label.replace(/\s+/g, '_')}_${selectedDoc.santriName.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download dimulai');
    } catch (error) {
      console.error(error);
      window.open(selectedDoc.url, '_blank');
      toast.info('Membuka di tab baru (Gunakan Save Image As...)');
    }
  };
  const columns: ColumnDef<any>[] = [
    {
      id: 'no',
      header: 'No',
      cell: ({ row }) => <div className="text-center w-[40px] font-medium text-muted-foreground">{row.index + 1}</div>,
    },
    {
      accessorKey: 'nama_lengkap',
      header: 'Nama Santri & NISN',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold text-base text-foreground">{row.original.nama_lengkap}</p>
          <div className="flex items-center gap-2">
             <Badge variant="secondary" className="text-[10px] px-1.5 h-5">{row.original.nisn}</Badge>
          </div>
        </div>
      ),
    },
    {
      id: 'doc_status',
      header: 'Status Dokumen Kelengkapan',
      cell: ({ row }) => {
        const s = row.original;
        const docs: { label: string; url: string; approved: boolean; key: DocType }[] = [
          { label: 'Foto', url: s.foto_santri, approved: s.foto_santri_approved, key: 'foto_santri' },
          { label: 'KTP', url: s.foto_ktp, approved: s.foto_ktp_approved, key: 'foto_ktp' },
          { label: 'Akta', url: s.foto_akta, approved: s.foto_akta_approved, key: 'foto_akta' },
          { label: 'Ijazah', url: s.foto_ijazah, approved: s.foto_ijazah_approved, key: 'foto_ijazah' },
          { label: 'Sehat', url: s.surat_sehat, approved: s.surat_sehat_approved, key: 'surat_sehat' },
          { label: 'KK', url: s.foto_kk, approved: s.foto_kk_approved, key: 'foto_kk' },
        ];
        return (
          <div className="flex gap-2 flex-wrap items-center">
            {docs.map((doc) => (
              <Badge
                key={doc.key}
                variant="outline"
                className={cn(
                  "cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 py-1.5 px-3 h-8",
                  !doc.url ? "bg-muted/50 text-muted-foreground border-dashed border-muted-foreground/30 cursor-default opacity-60 hover:scale-100" :
                  doc.approved ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" :
                  "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                )}
                onClick={() => {
                  if (doc.url) {
                    setSelectedDoc({
                      santriId: s.id,
                      santriName: s.nama_lengkap,
                      type: doc.key,
                      label: doc.label,
                      url: doc.url,
                      approved: doc.approved
                    });
                  }
                }}
              >
                <span className="font-medium">{doc.label}</span>
                {doc.url && (
                    doc.approved ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />
                )}
              </Badge>
            ))}
          </div>
        );
      }
    },
  ];
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Verifikasi Dokumen Santri"
        description="Kelola dan verifikasi dokumen persyaratan pendaftaran santri baru."
        icon={FileCheck}
      />
      <DataTable
        columns={columns}
        data={santriData || []}
        isLoading={isLoading}
        onRefresh={refetch}
        searchKey="nama_lengkap"
        searchPlaceholder="Cari nama santri..."
      />
      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-2xl w-[95vw] h-auto max-h-[90vh] flex flex-col z-[999] p-0 overflow-hidden gap-0">
          <div className="p-6 pb-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Verifikasi: {selectedDoc?.label}</span>
                {selectedDoc?.approved && (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700 ml-2">
                    Terverifikasi
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Santri: <span className="font-medium text-foreground">{selectedDoc?.santriName}</span>
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 bg-black/5 flex items-center justify-center overflow-auto min-h-[300px] max-h-[50vh] relative group p-4">
            {selectedDoc?.url ? (
              <img 
                src={selectedDoc.url} 
                alt="Document Preview" 
                className="w-full h-full object-contain transition-transform duration-200"
              />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-2">
                <FileX className="h-10 w-10" />
                <p>Tidak ada preview tersedia</p>
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <Button size="icon" variant="secondary" onClick={handleDownload} title="Download">
                 <Download className="h-4 w-4" />
               </Button>
               <Button size="icon" variant="secondary" onClick={() => window.open(selectedDoc?.url, '_blank')} title="Buka di Tab Baru">
                 <ExternalLink className="h-4 w-4" />
               </Button>
            </div>
          </div>
          <div className="p-4 border-t bg-muted/10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
             <div className="text-xs text-muted-foreground hidden sm:block">
                Pastikan dokumen terbaca jelas dan sesuai dengan persyaratan sebelum melakukan verifikasi.
             </div>
             <div className="flex gap-2 w-full justify-end">
              <Button variant="ghost" onClick={() => setSelectedDoc(null)}>
                Batal
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleVerifyDoc(false)}
                disabled={selectedDoc?.approved === false}
                className="flex-1 sm:flex-none"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Tolak
              </Button>
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                onClick={() => handleVerifyDoc(true)}
                disabled={selectedDoc?.approved === true}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                ACC Dokumen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}