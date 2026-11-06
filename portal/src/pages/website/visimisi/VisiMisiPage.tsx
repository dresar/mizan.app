import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2, Award, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useLocation } from 'react-router-dom';

const visiMisiSchema = z.object({
  visi: z.string().min(1, 'Visi harus diisi'),
  misi: z.string().min(1, 'Misi harus diisi'),
});
type VisiMisiForm = z.infer<typeof visiMisiSchema>;
export default function VisiMisiPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm<VisiMisiForm>({
    resolver: zodResolver(visiMisiSchema),
    defaultValues: {
      visi: '',
      misi: '',
    },
  });
  const { data, isLoading } = useQuery({
    queryKey: ['visiMisi'],
    queryFn: async () => {
      const response = await api.get('/core/visi-misi');
      return response.data;
    },
  });
  useEffect(() => {
    if (data) {
      form.reset({
        visi: data.visi || '',
        misi: data.misi || '',
      });
    }
  }, [data, form]);

  useEffect(() => {
    if (location.state?.aiContent) {
      const content = location.state.aiContent;
      // Mencoba memisahkan Visi dan Misi jika formatnya jelas
      const parts = content.split(/Misi:/i);
      if (parts.length > 1) {
        form.setValue('visi', parts[0].replace(/Visi:/i, '').trim(), { shouldDirty: true });
        form.setValue('misi', parts[1].trim(), { shouldDirty: true });
      } else {
        form.setValue('visi', content, { shouldDirty: true });
      }
      
      // Clear state so it doesn't re-apply on refresh/navigation
      window.history.replaceState({}, document.title);
      toast.success("Konten dari AI berhasil dimuat");
    }
  }, [location.state, form]);

  const mutation = useMutation({
    mutationFn: (values: VisiMisiForm) => api.put('/core/visi-misi', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visiMisi'] });
      toast.success('Visi & Misi berhasil diperbarui');
    },
    onError: () => {
      toast.error('Gagal memperbarui Visi & Misi');
    },
  });
  if (isLoading) return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-20" />;
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Visi & Misi"
        description="Kelola visi dan misi pesantren"
        icon={Award}
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Form Visi & Misi</CardTitle>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/ai-generator?type=vision_mission&returnUrl=/admin/vision-mission')}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Bantu Buat Visi Misi
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
              <FormField
                control={form.control}
                name="visi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visi</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={6} placeholder="Masukkan Visi..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="misi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Misi</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={8} placeholder="Masukkan Misi..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}