import { PageHeader } from '@/components/common';
import { User, Save, Loader2, Building2, BookOpen, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth-store';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Nama depan wajib diisi'),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  institution: z.string().min(1, 'Institusi wajib diisi'),
  expertise: z.string().optional(),
  whatsapp: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AuthorProfilePage() {
  const { user, updateUser } = useAuthStore();
  
  // Determine verification status
  const status = (user as any)?.publicationStatus || (user as any)?.verificationStatus || 'none';
  const isVerified = (user as any)?.publicationVerified || (user as any)?.isVerified;
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: (user as any)?.bio || '',
      institution: (user as any)?.institution || '',
      expertise: (user as any)?.expertise || '',
      whatsapp: (user as any)?.whatsapp || '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      return api.put('/publication/author/profile', values);
    },
    onSuccess: (response) => {
      // Update local user store
      if (response.data.data) {
        // Merge existing user with new data
        // The response might be the user object or just success
        // Let's refetch user to be safe
        api.get('/auth/me').then(res => updateUser(res.data));
      }
      toast.success('Profil berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Gagal memperbarui profil');
    }
  });

  const onSubmit = (values: ProfileFormValues) => {
    mutation.mutate(values);
  };

  const getStatusAlert = () => {
    if (status === 'approved' || isVerified) {
      return (
        <Alert className="bg-green-50 border-green-200 mb-6">
          <User className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Akun Terverifikasi</AlertTitle>
          <AlertDescription className="text-green-700">
            Akun Anda telah terverifikasi sebagai penulis. Anda dapat mempublikasikan artikel dan jurnal.
          </AlertDescription>
        </Alert>
      );
    }
    if (status === 'pending') {
      return (
        <Alert className="bg-yellow-50 border-yellow-200 mb-6">
          <User className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Menunggu Verifikasi</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Profil Anda sedang ditinjau oleh admin. Beberapa fitur mungkin terbatas hingga verifikasi selesai.
          </AlertDescription>
        </Alert>
      );
    }
    if (status === 'rejected') {
      return (
        <Alert variant="destructive" className="mb-6">
          <User className="h-4 w-4" />
          <AlertTitle>Verifikasi Ditolak</AlertTitle>
          <AlertDescription>
            Pengajuan Anda ditolak. Silakan perbarui profil Anda dan ajukan kembali.
            {(user as any)?.rejectedReason && (
              <div className="mt-2 font-semibold">Alasan: {(user as any)?.rejectedReason}</div>
            )}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <PageHeader
        title="Profil Publikasi"
        description="Kelola informasi profil penulis dan status verifikasi Anda"
        icon={User}
      />

      {getStatusAlert()}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Info Akun</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/20">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary mb-4">
                            {user?.firstName?.charAt(0)}
                        </div>
                        <h3 className="font-bold text-lg">{user?.firstName} {user?.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <div className="mt-2">
                            <Badge variant={isVerified ? "default" : "secondary"}>
                                {isVerified ? "Verified Author" : "Unverified"}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Profil Penulis</CardTitle>
                    <CardDescription>
                        Informasi ini akan ditampilkan pada setiap artikel dan jurnal yang Anda publikasikan.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Depan</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Belakang</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="institution"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Institusi / Afiliasi</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" placeholder="Nama Universitas / Lembaga" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Tempat Anda bekerja atau belajar saat ini.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="expertise"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bidang Keahlian</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" placeholder="Contoh: Pendidikan Islam, Teknologi, dll" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="whatsapp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>WhatsApp (Untuk Koordinasi)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" placeholder="08..." {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Biografi Singkat</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Ceritakan sedikit tentang diri Anda..." 
                                                rows={4}
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan Profil
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
