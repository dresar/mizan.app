import { useState, useEffect } from 'react';
import { Settings, Save, LayoutTemplate } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface FormField {
  fieldKey: string;
  fieldLabel: string;
  fieldValue: string;
}

interface FormConfigResponse {
  [key: string]: FormField & { id: number; formName: string; updatedAt: string };
}

const DEFAULT_FIELDS = [
  { key: 'judul_form', label: 'Judul Halaman Formulir', type: 'text', default: 'Formulir Pendaftaran Calon Santri' },
  { key: 'subtitle_form', label: 'Sub-judul', type: 'text', default: 'Silakan lengkapi data di bawah ini untuk mendaftar.' },
  { key: 'intro_text', label: 'Teks Pengantar (Ketentuan)', type: 'textarea', default: 'Pastikan data yang Anda masukkan adalah benar dan valid sesuai dokumen resmi.' },
  { key: 'label_biodata', label: 'Label Bagian Biodata', type: 'text', default: 'Biodata Calon Santri' },
  { key: 'label_orangtua', label: 'Label Bagian Orang Tua', type: 'text', default: 'Data Orang Tua / Wali' },
  { key: 'label_alamat', label: 'Label Bagian Alamat', type: 'text', default: 'Alamat Lengkap' },
  { key: 'label_dokumen', label: 'Label Bagian Dokumen', type: 'text', default: 'Berkas Persyaratan' },
];

export default function FormConfigPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-form-config', 'pendaftaran'],
    queryFn: async () => {
      const res = await api.get('/admin/form-config?form=pendaftaran');
      return res.data;
    }
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const initial: Record<string, string> = {};
      DEFAULT_FIELDS.forEach(f => {
        const found = data.find((d: any) => d.fieldKey === f.key);
        initial[f.key] = found ? found.fieldValue : f.default;
      });
      setFormData(initial);
    } else {
      const initial: Record<string, string> = {};
      DEFAULT_FIELDS.forEach(f => { initial[f.key] = f.default; });
      setFormData(initial);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload: { formName: string; fields: Array<FormField> }) => {
      return api.put('/admin/form-config', payload);
    },
    onSuccess: () => {
      toast({ title: 'Berhasil', description: 'Konfigurasi formulir berhasil disimpan.' });
      queryClient.invalidateQueries({ queryKey: ['admin-form-config'] });
    },
    onError: (error) => {
      toast({ title: 'Gagal', description: 'Gagal menyimpan konfigurasi.', variant: 'destructive' });
      console.error(error);
    }
  });

  const handleSave = () => {
    const fieldsToSave = DEFAULT_FIELDS.map(f => ({
      fieldKey: f.key,
      fieldLabel: f.label,
      fieldValue: formData[f.key] || f.default,
    }));
    mutation.mutate({
      formName: 'pendaftaran',
      fields: fieldsToSave,
    });
  };

  if (isLoading) return <div className="p-8 text-center">Loading konfigurasi...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Konfigurasi Formulir Pendaftaran"
        subtitle="Ubah teks, judul, dan label yang muncul di halaman public pendaftaran."
        icon={LayoutTemplate}
        breadcrumbs={[
          { label: 'Website', path: '/admin/website-settings' },
          { label: 'Form Config' }
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Teks Formulir Utama</CardTitle>
          <CardDescription>Sesuaikan kata-kata yang akan dibaca calon pendaftar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {DEFAULT_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key} className="text-base">{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.key}
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  rows={4}
                />
              ) : (
                <Input
                  id={field.key}
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
          
          <div className="pt-6 border-t flex justify-end">
            <Button onClick={handleSave} disabled={mutation.isPending}>
              {mutation.isPending ? 'Menyimpan...' : (
                 <>
                   <Save className="w-4 h-4 mr-2" />
                   Simpan Konfigurasi
                 </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
