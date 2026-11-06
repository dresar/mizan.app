import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useDebounce } from 'react-use';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Upload, 
  FileText, 
  User, 
  Users, 
  GraduationCap, 
  Award, 
  Send,
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DatePickerInput } from '@/components/ui/date-picker-input';
import { santriService } from '@/services/santri-service';
import { usePublicData } from '@/hooks/use-public-data';
import { FormPendaftaranData, initialFormData } from '@/types/form';

// Schema Validasi
export const santriSchema = z.object({
  namaLengkap: z.string().min(3, 'Nama lengkap wajib diisi'),
  namaPanggilan: z.string().optional().or(z.literal('')),
  nisn: z.string().regex(/^\d{10}$/, 'NISN harus tepat 10 digit angka'),
  tempatLahir: z.string().min(1, 'Tempat lahir wajib diisi'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  jenisKelamin: z.enum(['L', 'P'], { 
    required_error: 'Pilih jenis kelamin', 
    invalid_type_error: 'Pilih jenis kelamin',
    message: 'Pilih jenis kelamin'
  }).nullable().refine((val) => val !== null, { message: 'Jenis kelamin harus diisi' }),
  agama: z.string().min(1, 'Agama wajib diisi'),
  kewarganegaraan: z.string().min(1, 'Kewarganegaraan wajib diisi'),
  anakKe: z.string().optional(),
  jumlahSaudara: z.string().optional(),
  golonganDarah: z.string().optional().refine((val) => {
    if (!val) return true;
    return ['A', 'B', 'AB', 'O'].includes(val.toUpperCase());
  }, { message: 'Golongan darah harus A, B, AB, atau O' }),
  tinggiBadan: z.string().optional(),
  beratBadan: z.string().optional(),
  riwayatPenyakit: z.string().optional(),
  bahasaSehariHari: z.string().optional(),
  tinggalDengan: z.string().optional(),
  alamat: z.string().min(5, 'Alamat wajib diisi lengkap'),
  desa: z.string().optional(),
  kecamatan: z.string().optional(),
  kabupaten: z.string().optional(),
  provinsi: z.string().optional(),
  kodePos: z.string().optional(),
});

export const orangTuaSchema = z.object({
  namaAyah: z.string().min(1, 'Nama ayah wajib diisi'),
  nikAyah: z.string().optional(),
  pekerjaanAyah: z.string().min(1, 'Pekerjaan ayah wajib diisi'),
  pendidikanAyah: z.string().optional(),
  penghasilanAyah: z.string().min(1, 'Pilih penghasilan ayah'),
  statusAyah: z.string().optional(),
  noHpAyah: z.string().optional(),
  
  namaIbu: z.string().min(1, 'Nama ibu wajib diisi'),
  nikIbu: z.string().optional(),
  pekerjaanIbu: z.string().min(1, 'Pekerjaan ibu wajib diisi'),
  pendidikanIbu: z.string().optional(),
  penghasilanIbu: z.string().min(1, 'Pilih penghasilan ibu'),
  statusIbu: z.string().optional(),
  noHpIbu: z.string().optional(),

  noWhatsapp: z.string().min(10, 'Nomor WhatsApp minimal 10 digit').max(13, 'Nomor WhatsApp maksimal 13 digit').regex(/^(0|\+62)\d+$/, 'Nomor harus diawali 0 atau +62 dan berupa angka'),
  alamatOrangTua: z.string().optional().or(z.literal('')),
});

const pendidikanSchema = z.object({
  namaSekolah: z.string().min(1, 'Nama sekolah asal wajib diisi'),
  npsnSekolah: z.string().optional(),
  tahunLulus: z.string().regex(/^\d{4}$/, 'Tahun lulus harus 4 digit angka'),
  noIjazah: z.string().optional(),
  nilaiRataRata: z.string().regex(/^\d+(\.\d+)?$/, 'Nilai harus berupa angka (contoh: 85.5)'),
});

// Add these options constant
const PENGHASILAN_OPTIONS = [
  "< 1 Juta",
  "1 - 5 Juta",
  "5 - 10 Juta",
  "10 - 20 Juta",
  "> 20 Juta"
];

const PEKERJAAN_OPTIONS = [
  "Ibu Rumah Tangga",
  "Petani",
  "Nelayan",
  "Pedagang",
  "Wiraswasta",
  "PNS",
  "TNI/Polri",
  "Karyawan Swasta",
  "Buruh",
  "Pensiunan",
  "Lainnya"
];

const PENDIDIKAN_OPTIONS = [
  "Tidak Sekolah",
  "SD/Sederajat",
  "SMP/Sederajat",
  "SMA/Sederajat",
  "D1",
  "D2",
  "D3",
  "D4/S1",
  "S2",
  "S3/Doktor/Profesor"
];

// Update inputClass definition
const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// Komponen Input Lokal
const Input = ({ label, error, numericOnly, ...props }: any) => (
  <div>
    <label className="text-sm font-medium mb-1.5 block">{label}</label>
    <input 
      className={`${inputClass} ${error ? 'border-destructive ring-destructive/20' : ''}`} 
      onInput={(e) => {
        if (numericOnly) {
          e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
        }
      }}
      {...props} 
    />
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

const PekerjaanInput = ({ label, value, onChange, error }: any) => {
  const selectValue = PEKERJAAN_OPTIONS.includes(value) ? value : (value ? 'Lainnya' : '');
  
  return (
    <div>
       <label className="text-sm font-medium mb-1.5 block">{label}</label>
       <select 
         className={`${inputClass} ${error ? 'border-destructive ring-destructive/20' : ''}`}
         value={selectValue}
         onChange={(e) => {
           const val = e.target.value;
           if (val === 'Lainnya') {
             onChange('Lainnya'); 
           } else {
             onChange(val);
           }
         }}
       >
         <option value="">-- Pilih Pekerjaan --</option>
         {PEKERJAAN_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
         ))}
       </select>
       
       {selectValue === 'Lainnya' && (
         <input 
           className={`${inputClass} mt-2`}
           placeholder="Sebutkan pekerjaan spesifik..."
           value={value === 'Lainnya' ? '' : value}
           onChange={(e) => onChange(e.target.value)}
         />
       )}
       {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

// Komponen Upload
const UploadField = ({ label, onFileSelect, accept }: { label: string, onFileSelect: (f: File) => void, accept?: string }) => {
  const [fileName, setFileName] = useState<string>('');

  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer relative group">
        <input 
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          accept={accept || ".pdf,.jpg,.jpeg,.png"}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setFileName(file.name);
              onFileSelect(file);
            }
          }}
        />
        <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground">
          {fileName ? (
            <>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <span className="text-sm font-medium text-foreground">{fileName}</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8" />
              <span className="text-sm">Klik untuk upload atau drag & drop</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ReviewSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-muted/30 p-4 rounded-lg border">
    <h4 className="font-medium mb-3 text-primary flex items-center gap-2">
      <CheckCircle2 className="w-4 h-4" /> {title}
    </h4>
    <div className="space-y-2 text-sm">
      {children}
    </div>
  </div>
);

const ReviewRow = ({ label, value }: { label: string, value: string }) => (
  <div className="grid grid-cols-3 gap-2 py-1 border-b border-border/50 last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="col-span-2 font-medium">{value || '-'}</span>
  </div>
);

export default function FormPendaftaranPage() {
  const [current, setCurrent] = useState(0);
  const [data, setData] = useState<FormPendaftaranData>({
    ...initialFormData,
    santri: {
        ...initialFormData.santri,
        jenisKelamin: 'L',
        kewarganegaraan: 'Indonesia',
    }
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load configuration
  const { data: config = {} } = usePublicData<Record<string, string>>(
    ['form-config', 'pendaftaran'], 
    '/core/form-config?form=pendaftaran'
  );

  const steps = [
    { title: config.label_biodata || 'Data Santri', icon: User },
    { title: config.label_orangtua || 'Orang Tua', icon: Users },
    { title: 'Pendidikan', icon: GraduationCap },
    { title: 'Minat Bakat', icon: Award },
    { title: config.label_dokumen || 'Dokumen', icon: FileText },
    { title: 'Review', icon: CheckCircle2 },
  ];

  // Auto-save logic
  useDebounce(
    () => {
      // Only auto-save if data is somewhat populated
      // AND if NISN is valid (required for initial creation to avoid 400 errors)
      const isNisnValid = /^\d{10}$/.test(data.santri.nisn);
      
      if (data.santri.namaLengkap && isNisnValid) {
        handleAutoSave();
      }
    },
    3000,
    [data]
  );

  const handleAutoSave = async () => {
    setSaveStatus('saving');
    try {
      await santriService.submitRegistration(data, true);
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed", error);
      setSaveStatus('error');
    }
  };

  const update = (section: keyof FormPendaftaranData, field: string, value: any) => {
    // Special handling for empty gender to avoid enum validation error immediately
    let finalValue = value;
    if (section === 'santri' && field === 'jenisKelamin' && value === '') {
        finalValue = null; 
    }

    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: finalValue
      }
    }));
    // Clear error when typing
    if (errors[field]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = () => {
    try {
      if (current === 0) santriSchema.parse(data.santri);
      if (current === 1) orangTuaSchema.parse(data.orangTua);
      if (current === 2) pendidikanSchema.parse(data.pendidikan);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: any = {};
        const errorMessages: string[] = [];
        
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0]] = err.message;
            errorMessages.push(err.message);
          }
        });
        setErrors(formattedErrors);
        
        // Show specific error messages in toast (limit to first 3 to avoid clutter)
        const displayMessages = errorMessages.slice(0, 3);
        const remaining = errorMessages.length - 3;
        
        toast({
          title: "Validasi Gagal",
          description: (
            <ul className="list-disc pl-4 mt-1">
              {displayMessages.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
              {remaining > 0 && <li>...dan {remaining} kesalahan lainnya</li>}
            </ul>
          ),
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const next = () => {
    if (validateStep()) {
      setCurrent(c => Math.min(steps.length - 1, c + 1));
      window.scrollTo(0, 0);
    }
  };

  const prev = () => {
    setCurrent(c => Math.max(0, c - 1));
    window.scrollTo(0, 0);
  };

  const submit = async (isDraft = false) => {
    setLoading(true);
    try {
      if (!isDraft) {
        // Validate all steps before submitting permanently
        const isSantriValid = santriSchema.safeParse(data.santri).success;
        const isOrangTuaValid = orangTuaSchema.safeParse(data.orangTua).success;
        const isPendidikanValid = pendidikanSchema.safeParse(data.pendidikan).success;

        if (!isSantriValid || !isOrangTuaValid || !isPendidikanValid) {
          toast({
            title: "Validasi Gagal",
            description: "Mohon periksa kembali data di setiap langkah. Pastikan semua field wajib diisi.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }

      await santriService.submitRegistration(data, isDraft);
      
      if (isDraft) {
        toast({
            title: "Draft Disimpan",
            description: "Data pendaftaran berhasil disimpan sebagai draft.",
        });
        setSaveStatus('saved');
        setLastSaved(new Date());
      } else {
        toast({
            title: "Pendaftaran Berhasil",
            description: "Data Anda telah tersimpan. Silakan tunggu verifikasi admin.",
        });
        navigate('/app/dashboard');
      }
    } catch (error: any) {
      console.error('Registration Error:', error);
      const errorMessage = error.response?.data?.error || error.message || "Terjadi kesalahan saat menyimpan data.";
      toast({
        title: "Gagal Menyimpan",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepIcon = steps[current].icon;

  return (
    <div className="container max-w-4xl py-8 px-4 md:px-6">
      <div className="flex justify-between items-start mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{config.judul_form || 'Formulir Pendaftaran Santri Baru'}</h1>
            <p className="text-muted-foreground">{config.subtitle_form || 'Lengkapi data diri dengan benar dan jujur untuk keperluan administrasi.'}</p>
            {config.intro_text && (
              <div className="mt-4 p-4 bg-primary/10 text-primary-foreground border border-primary/20 rounded-lg text-sm">
                {config.intro_text}
              </div>
            )}
        </div>
        <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-end mb-1">
                {saveStatus === 'saving' && <><Loader2 className="w-3 h-3 animate-spin" /> Menyimpan...</>}
                {saveStatus === 'saved' && <><CheckCircle2 className="w-3 h-3 text-green-500" /> Tersimpan</>}
                {saveStatus === 'error' && <><AlertCircle className="w-3 h-3 text-red-500" /> Gagal simpan</>}
            </div>
            {lastSaved && <p className="text-xs text-muted-foreground/70">Terakhir disimpan: {lastSaved.toLocaleTimeString()}</p>}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 overflow-x-auto pb-4">
        <div className="flex justify-between items-center min-w-[600px] px-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === current;
            const isCompleted = idx < current;
            
            return (
              <div key={idx} className="flex flex-col items-center relative z-10 group cursor-pointer" onClick={() => idx < current && setCurrent(idx)}>
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 border-2
                    ${isActive ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-lg' : 
                      isCompleted ? 'bg-green-500 text-white border-green-500' : 'bg-background text-muted-foreground border-muted-foreground/30'}
                  `}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{step.title}</span>
                
                {/* Connector Line */}
                {idx !== steps.length - 1 && (
                  <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 ${idx < current ? 'bg-green-500' : 'bg-muted'}`} 
                       style={{ width: 'calc(100% + (100% - 2.5rem) / 2)' }} // Rough calculation
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Card className="border-t-4 border-t-primary shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            {CurrentStepIcon && <CurrentStepIcon className="w-6 h-6 text-primary" />}
            {steps[current].title}
          </CardTitle>
          <CardDescription>
            Langkah {current + 1} dari {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Form Content */}
              {current === 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">{config.label_biodata || 'Data Santri'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input label="Nama Lengkap" value={data.santri.namaLengkap} onChange={(e: any) => update('santri', 'namaLengkap', e.target.value)} error={errors.namaLengkap} />
                </div>
                <div>
                  <Input label="Nama Panggilan" value={data.santri.namaPanggilan} onChange={(e: any) => update('santri', 'namaPanggilan', e.target.value)} error={errors.namaPanggilan} />
                </div>
                <div>
                  <Input label="NISN" value={data.santri.nisn} onChange={(e: any) => update('santri', 'nisn', e.target.value)} error={errors.nisn} placeholder="10 digit angka" maxLength={10} numericOnly />
                </div>
                <div>
                  <Input label="Tempat Lahir" value={data.santri.tempatLahir} onChange={(e: any) => update('santri', 'tempatLahir', e.target.value)} error={errors.tempatLahir} />
                </div>
                <div>
                  <DatePickerInput 
                    label="Tanggal Lahir" 
                    value={data.santri.tanggalLahir} 
                    onChange={(v: string) => update('santri', 'tanggalLahir', v)} 
                    error={errors.tanggalLahir} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Jenis Kelamin</label>
                  <select 
                    className={`${inputClass} ${errors.jenisKelamin ? 'border-destructive ring-destructive/20' : ''}`}
                    value={data.santri.jenisKelamin} 
                    onChange={(e) => update('santri', 'jenisKelamin', e.target.value)}
                  >
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                  {errors.jenisKelamin && <p className="text-xs text-destructive mt-1">{errors.jenisKelamin}</p>}
                </div>
                <div>
                  <Input label="Agama" value={data.santri.agama} onChange={(e: any) => update('santri', 'agama', e.target.value)} error={errors.agama} placeholder="Islam" />
                </div>
                <div>
                  <Input label="Kewarganegaraan" value={data.santri.kewarganegaraan} onChange={(e: any) => update('santri', 'kewarganegaraan', e.target.value)} error={errors.kewarganegaraan} placeholder="WNI" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Anak Ke" value={data.santri.anakKe} onChange={(e: any) => update('santri', 'anakKe', e.target.value)} numericOnly />
                  <Input label="Jml Saudara" value={data.santri.jumlahSaudara} onChange={(e: any) => update('santri', 'jumlahSaudara', e.target.value)} numericOnly />
                </div>
                <div className="grid grid-cols-3 gap-2">
                   <div>
                      <Input 
                        label="Gol. Darah" 
                        value={data.santri.golonganDarah} 
                        onChange={(e: any) => update('santri', 'golonganDarah', e.target.value)} 
                        error={errors.golonganDarah}
                        placeholder="Contoh: A, B, AB, atau O"
                      />
                   </div>
                   <Input label="Tinggi (cm)" value={data.santri.tinggiBadan} onChange={(e: any) => update('santri', 'tinggiBadan', e.target.value)} numericOnly />
                   <Input label="Berat (kg)" value={data.santri.beratBadan} onChange={(e: any) => update('santri', 'beratBadan', e.target.value)} numericOnly />
                </div>
                <div>
                   <Input label="Bahasa Sehari-hari" value={data.santri.bahasaSehariHari} onChange={(e: any) => update('santri', 'bahasaSehariHari', e.target.value)} />
                </div>
                <div>
                   <Input label="Tinggal Dengan" value={data.santri.tinggalDengan} onChange={(e: any) => update('santri', 'tinggalDengan', e.target.value)} placeholder="Orang Tua" />
                </div>
                <div className="md:col-span-2">
                   <Input label="Riwayat Penyakit" value={data.santri.riwayatPenyakit} onChange={(e: any) => update('santri', 'riwayatPenyakit', e.target.value)} placeholder="Jika ada, sebutkan" />
                </div>
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <h4 className="font-medium mb-2">{config.label_alamat || 'Alamat Lengkap'}</h4>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Alamat (Jalan, RT/RW)</label>
                  <textarea 
                    className={`${inputClass} min-h-[80px] resize-none ${errors.alamat ? 'border-destructive ring-destructive/20' : ''}`}
                    value={data.santri.alamat} 
                    onChange={(e) => update('santri', 'alamat', e.target.value)} 
                    placeholder="Jl. Nama Jalan No. XX, RT/RW" 
                  />
                  {errors.alamat && <p className="text-xs text-destructive mt-1">{errors.alamat}</p>}
                </div>
                <div>
                  <Input label="Desa/Kelurahan" value={data.santri.desa} onChange={(e: any) => update('santri', 'desa', e.target.value)} />
                </div>
                <div>
                  <Input label="Kecamatan" value={data.santri.kecamatan} onChange={(e: any) => update('santri', 'kecamatan', e.target.value)} />
                </div>
                <div>
                  <Input label="Kabupaten/Kota" value={data.santri.kabupaten} onChange={(e: any) => update('santri', 'kabupaten', e.target.value)} />
                </div>
                <div>
                  <Input label="Provinsi" value={data.santri.provinsi} onChange={(e: any) => update('santri', 'provinsi', e.target.value)} />
                </div>
                <div>
                  <Input label="Kode Pos" value={data.santri.kodePos} onChange={(e: any) => update('santri', 'kodePos', e.target.value)} numericOnly maxLength={5} />
                </div>
              </div>
            </div>
          )}
          {current === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">{config.label_orangtua || 'Data Orang Tua / Wali'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 border-b pb-2 mb-2 font-medium text-primary">Data Ayah</div>
                <Input label="Nama Ayah" value={data.orangTua.namaAyah} onChange={(e: any) => update('orangTua', 'namaAyah', e.target.value)} error={errors.namaAyah} />
                <Input label="NIK Ayah" value={data.orangTua.nikAyah} onChange={(e: any) => update('orangTua', 'nikAyah', e.target.value)} maxLength={16} numericOnly />
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Pendidikan Ayah</label>
                  <select 
                    className={`${inputClass}`}
                    value={data.orangTua.pendidikanAyah} 
                    onChange={(e) => update('orangTua', 'pendidikanAyah', e.target.value)}
                  >
                    <option value="">-- Pilih Pendidikan --</option>
                    {PENDIDIKAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <PekerjaanInput label="Pekerjaan Ayah" value={data.orangTua.pekerjaanAyah} onChange={(val: string) => update('orangTua', 'pekerjaanAyah', val)} error={errors.pekerjaanAyah} />
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Penghasilan Ayah</label>
                  <select 
                    className={`${inputClass} ${errors.penghasilanAyah ? 'border-destructive ring-destructive/20' : ''}`}
                    value={data.orangTua.penghasilanAyah} 
                    onChange={(e) => update('orangTua', 'penghasilanAyah', e.target.value)}
                  >
                    <option value="">-- Pilih Penghasilan --</option>
                    {PENGHASILAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {errors.penghasilanAyah && <p className="text-xs text-destructive mt-1">{errors.penghasilanAyah}</p>}
                </div>
                <Input label="No. HP Ayah" value={data.orangTua.noHpAyah} onChange={(e: any) => update('orangTua', 'noHpAyah', e.target.value)} numericOnly />
                
                <div className="md:col-span-2 border-b pb-2 mb-2 mt-4 font-medium text-primary">Data Ibu</div>
                <Input label="Nama Ibu" value={data.orangTua.namaIbu} onChange={(e: any) => update('orangTua', 'namaIbu', e.target.value)} error={errors.namaIbu} />
                <Input label="NIK Ibu" value={data.orangTua.nikIbu} onChange={(e: any) => update('orangTua', 'nikIbu', e.target.value)} maxLength={16} numericOnly />
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Pendidikan Ibu</label>
                  <select 
                    className={`${inputClass}`}
                    value={data.orangTua.pendidikanIbu} 
                    onChange={(e) => update('orangTua', 'pendidikanIbu', e.target.value)}
                  >
                    <option value="">-- Pilih Pendidikan --</option>
                    {PENDIDIKAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <PekerjaanInput label="Pekerjaan Ibu" value={data.orangTua.pekerjaanIbu} onChange={(val: string) => update('orangTua', 'pekerjaanIbu', val)} error={errors.pekerjaanIbu} />
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Penghasilan Ibu</label>
                  <select 
                    className={`${inputClass} ${errors.penghasilanIbu ? 'border-destructive ring-destructive/20' : ''}`}
                    value={data.orangTua.penghasilanIbu} 
                    onChange={(e) => update('orangTua', 'penghasilanIbu', e.target.value)}
                  >
                    <option value="">-- Pilih Penghasilan --</option>
                    {PENGHASILAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {errors.penghasilanIbu && <p className="text-xs text-destructive mt-1">{errors.penghasilanIbu}</p>}
                </div>
                <Input label="No. HP Ibu" value={data.orangTua.noHpIbu} onChange={(e: any) => update('orangTua', 'noHpIbu', e.target.value)} numericOnly />

                <div className="md:col-span-2 border-b pb-2 mb-2 mt-4 font-medium text-primary">Kontak & Alamat</div>
                <Input label="No. WhatsApp (Utama)" value={data.orangTua.noWhatsapp} onChange={(e: any) => update('orangTua', 'noWhatsapp', e.target.value)} error={errors.noWhatsapp} placeholder="08xxxxxxxxxx" maxLength={15} numericOnly />
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Alamat Orang Tua (Jika beda dengan santri)</label>
                  <textarea 
                    className={`${inputClass} min-h-[80px] resize-none ${errors.alamatOrangTua ? 'border-destructive ring-destructive/20' : ''}`}
                    value={data.orangTua.alamatOrangTua} 
                    onChange={(e) => update('orangTua', 'alamatOrangTua', e.target.value)} 
                    placeholder="Alamat lengkap" 
                  />
                  {errors.alamatOrangTua && <p className="text-xs text-destructive mt-1">{errors.alamatOrangTua}</p>}
                </div>
              </div>
            </div>
          )}
          {current === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Pendidikan Sebelumnya</h3>
              <Input label="Nama Sekolah Asal" value={data.pendidikan.namaSekolah} onChange={(e: any) => update('pendidikan', 'namaSekolah', e.target.value)} error={errors.namaSekolah} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="NPSN Sekolah" value={data.pendidikan.npsnSekolah} onChange={(e: any) => update('pendidikan', 'npsnSekolah', e.target.value)} />
                <Input label="Tahun Lulus" value={data.pendidikan.tahunLulus} onChange={(e: any) => update('pendidikan', 'tahunLulus', e.target.value)} error={errors.tahunLulus} placeholder="YYYY" maxLength={4} numericOnly />
                <Input label="No. Ijazah" value={data.pendidikan.noIjazah} onChange={(e: any) => update('pendidikan', 'noIjazah', e.target.value)} />
                <Input label="Nilai Rata-rata" value={data.pendidikan.nilaiRataRata} onChange={(e: any) => update('pendidikan', 'nilaiRataRata', e.target.value)} error={errors.nilaiRataRata} placeholder="85.5" />
              </div>
            </div>
          )}
          {current === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Minat & Bakat (Opsional)</h3>
              <div className="space-y-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Prestasi Akademik / Non-Akademik</label>
                  <textarea 
                    className={`${inputClass} min-h-[80px] resize-none`}
                    value={data.tambahan.prestasi} 
                    onChange={(e) => update('tambahan', 'prestasi', e.target.value)} 
                    placeholder="Contoh: Juara 1 Lomba Adzan Tingkat Kabupaten" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Hobi</label>
                  <input className={inputClass} value={data.tambahan.hobi} onChange={(e) => update('tambahan', 'hobi', e.target.value)} placeholder="Contoh: Membaca, Futsal" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Keahlian Khusus</label>
                  <input className={inputClass} value={data.tambahan.keahlian} onChange={(e) => update('tambahan', 'keahlian', e.target.value)} placeholder="Contoh: Desain Grafis, Tahfidz 5 Juz" />
                </div>
              </div>
            </div>
          )}
          {current === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">{config.label_dokumen || 'Upload Dokumen'}</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload dokumen persyaratan. Format: PDF, JPG, PNG (maks. 2MB).</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <UploadField label="Akte Kelahiran" onFileSelect={(n: File) => update('dokumen', 'akteLahir', n)} />
                    {errors.akteLahir && <p className="text-xs text-destructive">{errors.akteLahir}</p>}
                </div>
                <div className="space-y-1">
                    <UploadField label="Kartu Keluarga" onFileSelect={(n: File) => update('dokumen', 'kartuKeluarga', n)} />
                    {errors.kartuKeluarga && <p className="text-xs text-destructive">{errors.kartuKeluarga}</p>}
                </div>
                <div className="space-y-1">
                    <UploadField label="Pas Foto 3x4" accept=".jpg,.png" onFileSelect={(n: File) => update('dokumen', 'pasFoto', n)} />
                    {errors.pasFoto && <p className="text-xs text-destructive">{errors.pasFoto}</p>}
                </div>
                <UploadField label="Ijazah / SKL (Jika ada)" onFileSelect={(n: File) => update('dokumen', 'ijazah', n)} />
              </div>
            </div>
          )}
          {current === 5 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg mb-4">Review Data Pendaftaran</h3>
              <ReviewSection title="Data Santri">
                <ReviewRow label="Nama Lengkap" value={data.santri.namaLengkap} />
                <ReviewRow label="Nama Panggilan" value={data.santri.namaPanggilan} />
                <ReviewRow label="Tempat, Tanggal Lahir" value={`${data.santri.tempatLahir}, ${data.santri.tanggalLahir}`} />
                <ReviewRow label="Jenis Kelamin" value={data.santri.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
                <ReviewRow label="NISN" value={data.santri.nisn} />
                <ReviewRow label="Alamat" value={`${data.santri.alamat}, ${data.santri.desa}, ${data.santri.kecamatan}`} />
              </ReviewSection>
              <ReviewSection title="Data Orang Tua">
                <ReviewRow label="Nama Ayah" value={data.orangTua.namaAyah} />
                <ReviewRow label="Pekerjaan Ayah" value={data.orangTua.pekerjaanAyah} />
                <ReviewRow label="Nama Ibu" value={data.orangTua.namaIbu} />
                <ReviewRow label="Pekerjaan Ibu" value={data.orangTua.pekerjaanIbu} />
                <ReviewRow label="No. WhatsApp" value={data.orangTua.noWhatsapp} />
              </ReviewSection>
              <ReviewSection title="Pendidikan & Minat">
                <ReviewRow label="Sekolah Asal" value={data.pendidikan.namaSekolah} />
                <ReviewRow label="Tahun Lulus" value={data.pendidikan.tahunLulus} />
                <ReviewRow label="Nilai Rata-rata" value={data.pendidikan.nilaiRataRata} />
              </ReviewSection>
              <ReviewSection title="Dokumen">
                <ReviewRow label="Akte Kelahiran" value={data.dokumen.akteLahir?.name || '—'} />
                <ReviewRow label="Kartu Keluarga" value={data.dokumen.kartuKeluarga?.name || '—'} />
                <ReviewRow label="Pas Foto" value={data.dokumen.pasFoto?.name || '—'} />
                <ReviewRow label="Ijazah" value={data.dokumen.ijazah?.name || '—'} />
              </ReviewSection>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <div className="p-6 pt-0 flex justify-between">
          <Button variant="outline" onClick={prev} disabled={current === 0 || loading}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Sebelumnya
          </Button>
          
          {current === steps.length - 1 ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => submit(true)} disabled={loading}>
                {loading && saveStatus === 'saving' ? 'Menyimpan...' : 'Simpan Draft'} <Save className="w-4 h-4 ml-2" />
              </Button>
              <Button onClick={() => submit(false)} disabled={loading}>
                {loading && saveStatus !== 'saving' ? 'Mengirim...' : 'Kirim Permanen'} <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <Button onClick={next}>
              Selanjutnya <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
