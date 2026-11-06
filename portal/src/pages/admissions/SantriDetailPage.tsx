import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Users, 
  MapPin, 
  School, 
  FileText, 
  Edit, 
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  Download,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { generateStudentPdf } from '@/lib/pdf-utils';
import { toast } from 'sonner';

export default function SantriDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: santri, isLoading, error } = useQuery({
    queryKey: ['santri', id],
    queryFn: async () => {
      const response = await api.get(`/admin/santri/${id}`);
      return response.data;
    },
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

  const handleDownloadPDF = async () => {
    if (!santri) return;
    
    try {
      toast.info('Sedang membuat PDF...');
      await generateStudentPdf(santri, docSettings);
      
      // Log activity
      await api.post('/admin/logs/document', {
        action: 'download_biodata',
        details: `Santri: ${santri.namaLengkap} (${santri.id})`
      });

      toast.success('PDF berhasil didownload');
    } catch (e) {
      console.error(e);
      toast.error('Gagal membuat PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }
  if (error || !santri) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-500">Santri tidak ditemukan</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/admissions')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>
    );
  }
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    accepted: 'bg-green-100 text-green-800 hover:bg-green-100',
    rejected: 'bg-red-100 text-red-800 hover:bg-red-100',
  };
  const paymentStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    verified: 'bg-green-100 text-green-800 hover:bg-green-100',
    rejected: 'bg-red-100 text-red-800 hover:bg-red-100',
  };
  const documents = [
    { label: 'Foto Santri', url: santri.fotoSantri, type: 'image' },
    { label: 'KTP Orang Tua', url: santri.fotoKtp, type: 'image' },
    { label: 'Akta Kelahiran', url: santri.fotoAkta, type: 'image' },
    { label: 'Ijazah Terakhir', url: santri.fotoIjazah, type: 'image' },
    { label: 'Kartu Keluarga', url: santri.fotoKk, type: 'image' },
    { label: 'Surat Keterangan Sehat', url: santri.suratSehat, type: 'image' },
  ].filter(doc => doc.url); 
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Detail Santri"
        description={`Informasi lengkap ${santri.namaLengkap}`}
        icon={User}
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/admissions')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={() => navigate(`/admin/admissions/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Data
          </Button>
        </div>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-3">
        {}
        <Card className="md:col-span-1 h-fit">
          <CardHeader className="text-center">
            <div className="mx-auto w-32 h-32 rounded-full overflow-hidden bg-muted mb-4 border-2 border-primary/20">
              {santri.fotoSantri ? (
                <img src={santri.fotoSantri} alt={santri.namaLengkap} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <User size={48} />
                </div>
              )}
            </div>
            <CardTitle>{santri.namaLengkap}</CardTitle>
            <div className="flex justify-center gap-2 mt-2">
              <Badge variant="secondary" className={statusColors[santri.status as keyof typeof statusColors]}>
                {santri.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">NISN: {santri.nisn || '-'}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{santri.tempatLahir}, {formatDate(santri.tanggalLahir)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{santri.noHp || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{santri.email || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{santri.alamat}, {santri.kabupaten}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="personal">Pribadi</TabsTrigger>
                <TabsTrigger value="family">Keluarga</TabsTrigger>
                <TabsTrigger value="school">Sekolah</TabsTrigger>
                <TabsTrigger value="payment">Pembayaran</TabsTrigger>
                <TabsTrigger value="documents">Dokumen</TabsTrigger>
              </TabsList>
              <TabsContent value="personal" className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-primary" /> Data Pribadi
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <InfoItem label="Nama Panggilan" value={santri.namaPanggilan} />
                  <InfoItem label="Jenis Kelamin" value={santri.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
                  <InfoItem label="Agama" value={santri.agama} />
                  <InfoItem label="Kewarganegaraan" value={santri.kewarganegaraan} />
                  <InfoItem label="Anak Ke" value={santri.anakKe} />
                  <InfoItem label="Jumlah Saudara" value={santri.jumlahSaudara} />
                  <InfoItem label="Tinggi Badan" value={`${santri.tinggiBadan || '-'} cm`} />
                  <InfoItem label="Berat Badan" value={`${santri.beratBadan || '-'} kg`} />
                  <InfoItem label="Golongan Darah" value={santri.golonganDarah} />
                  <InfoItem label="Riwayat Penyakit" value={santri.riwayatPenyakit} fullWidth />
                </div>
              </TabsContent>
              <TabsContent value="family" className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" /> Data Ayah
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoItem label="Nama Ayah" value={santri.namaAyah} />
                    <InfoItem label="NIK" value={santri.nikAyah} />
                    <InfoItem label="Pekerjaan" value={santri.pekerjaanAyah} />
                    <InfoItem label="Pendidikan" value={santri.pendidikanAyah} />
                    <InfoItem label="Penghasilan" value={santri.penghasilanAyah} />
                    <InfoItem label="No. HP" value={santri.noHpAyah} />
                    <InfoItem label="Status" value={santri.statusAyah} />
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" /> Data Ibu
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoItem label="Nama Ibu" value={santri.namaIbu} />
                    <InfoItem label="NIK" value={santri.nikIbu} />
                    <InfoItem label="Pekerjaan" value={santri.pekerjaanIbu} />
                    <InfoItem label="Pendidikan" value={santri.pendidikanIbu} />
                    <InfoItem label="Penghasilan" value={santri.penghasilanIbu} />
                    <InfoItem label="No. HP" value={santri.noHpIbu} />
                    <InfoItem label="Status" value={santri.statusIbu} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="school" className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <School className="h-5 w-5 text-primary" /> Data Sekolah Asal
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <InfoItem label="Asal Sekolah" value={santri.asalSekolah} />
                  <InfoItem label="NPSN" value={santri.npsnSekolah} />
                  <InfoItem label="Kelas Terakhir" value={santri.kelasTerakhir} />
                  <InfoItem label="Tahun Lulus" value={santri.tahunLulus} />
                  <InfoItem label="No. Ijazah" value={santri.noIjazah} />
                </div>
              </TabsContent>
              <TabsContent value="payment" className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" /> Riwayat Pembayaran
                </h3>
                {santri.payment ? (
                   <Card className="bg-muted/50 border-dashed">
                     <CardContent className="pt-6">
                       <div className="flex justify-between items-center mb-4">
                         <span className="font-medium">Pendaftaran Awal</span>
                         <Badge className={paymentStatusColors[santri.payment.status as keyof typeof paymentStatusColors]}>
                           {santri.payment.status.toUpperCase()}
                         </Badge>
                       </div>
                       <div className="space-y-2 text-sm">
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Jumlah</span>
                           <span className="font-bold">Rp {Number(santri.payment.amount).toLocaleString('id-ID')}</span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Tanggal</span>
                           <span>{formatDate(santri.payment.createdAt)}</span>
                         </div>
                         {santri.payment.proofUrl && (
                           <div className="mt-4">
                             <p className="text-xs text-muted-foreground mb-2">Bukti Transfer:</p>
                             <a href={santri.payment.proofUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs">
                               Lihat Bukti
                             </a>
                           </div>
                         )}
                       </div>
                     </CardContent>
                   </Card>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                    Belum ada data pembayaran
                  </div>
                )}
              </TabsContent>
              <TabsContent value="documents" className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" /> Dokumen Pendukung
                </h3>
                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documents.map((doc, idx) => (
                      <Card key={idx} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="h-32 bg-muted/50 flex items-center justify-center border-b">
                            {doc.url.toLowerCase().endsWith('.pdf') ? (
                              <FileText className="h-12 w-12 text-muted-foreground" />
                            ) : (
                              <img src={doc.url} alt={doc.label} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="p-3 flex justify-between items-center">
                            <span className="font-medium text-sm">{doc.label}</span>
                            <a href={doc.url} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                    Belum ada dokumen yang diupload
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function InfoItem({ label, value, fullWidth = false }: { label: string; value: string | number | null | undefined; fullWidth?: boolean }) {
  return (
    <div className={`space-y-1 ${fullWidth ? 'col-span-2' : ''}`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="font-medium text-foreground">{value || '-'}</p>
    </div>
  );
}