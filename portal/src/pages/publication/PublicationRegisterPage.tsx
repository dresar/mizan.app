import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { FileSignature, Save, Loader2, AlertCircle, BookOpen, PenTool, Award, CheckCircle, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Schema for existing user (Publication Profile Only)
const existingUserSchema = z.object({
  bio: z.string().optional(),
  institution: z.string().optional(),
  whatsapp: z.string().optional(),
  expertise: z.string().optional(),
});

// Schema for new user (Full Registration)
const newUserSchema = existingUserSchema.extend({
  firstName: z.string().min(1, "Nama depan wajib diisi"),
  lastName: z.string().optional(),
  // username: z.string().min(3, "Username minimal 3 karakter"), // Auto generated
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  phone: z.string().min(10, "Nomor HP tidak valid"),
});

type ExistingUserValues = z.infer<typeof existingUserSchema>;
type NewUserValues = z.infer<typeof newUserSchema>;

export default function PublicationRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Jika user sudah login dan sudah terdaftar, redirect ke dashboard
  useEffect(() => {
    if (user && (user as any).isPublicationRegistered) {
      navigate('/author/dashboard');
    }
  }, [user, navigate]);

  const existingUserForm = useForm<ExistingUserValues>({
    resolver: zodResolver(existingUserSchema),
    defaultValues: {
      bio: '',
      institution: '',
      whatsapp: '',
      expertise: '',
    },
  });

  const newUserForm = useForm<NewUserValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      // username: '',
      email: '',
      password: '',
      phone: '',
      bio: '',
      institution: '',
      whatsapp: '',
      expertise: '',
    },
  });

  const onExistingUserSubmit = async (values: ExistingUserValues) => {
    setIsLoading(true);
    try {
      await api.post('/publication/register', values);
      toast.success('Pendaftaran berhasil! Silakan tunggu verifikasi admin.');
      navigate('/author/dashboard');
    } catch (error: any) {
      let message = 'Gagal mendaftar';
      if (error.response?.data?.error) {
          if (typeof error.response.data.error === 'string') {
              message = error.response.data.error;
          } else if (typeof error.response.data.error === 'object') {
              // Handle flattened Zod errors or other objects
              const errObj = error.response.data.error;
              message = Object.values(errObj).flat().join(', ') || JSON.stringify(errObj);
          }
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onNewUserSubmit = async (values: NewUserValues) => {
    setIsLoading(true);
    try {
      const response = await api.post('/publication/register/new', values);
      const { user: newUser, token } = response.data;
      
      // Auto login
      setAuth(newUser, token);
      
      toast.success('Akun berhasil dibuat dan pendaftaran berhasil!');
      
      // Explicitly redirect to Author Dashboard, not Admin Panel
      // Use replace to prevent back navigation to register page
      navigate('/author/dashboard', { replace: true });
      
    } catch (error: any) {
      let message = 'Gagal mendaftar';
      if (error.response?.data?.error) {
          if (typeof error.response.data.error === 'string') {
              message = error.response.data.error;
          } else if (typeof error.response.data.error === 'object') {
              const errObj = error.response.data.error;
              message = Object.values(errObj).flat().join(', ') || JSON.stringify(errObj);
          }
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Hero Section */}
      <div className="relative bg-primary/5 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        <div className="container relative max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
            Portal Publikasi Ilmiah
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
            Bergabunglah Menjadi Penulis <br className="hidden sm:inline" />
            <span className="text-primary">Kontributor Jurnal & Artikel</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Bagikan pemikiran, hasil penelitian, dan karya ilmiah Anda melalui platform publikasi resmi Pesantren. 
            Dapatkan kesempatan untuk mempublikasikan karya Anda secara luas.
          </p>
          
          <div className="flex justify-center gap-4 pt-4">
             <Button size="lg" className="h-12 px-8 text-lg" onClick={() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' })}>
               {user ? 'Lengkapi Formulir' : 'Daftar Sekarang'}
             </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg" asChild>
                <a href="/jurnal">Lihat Jurnal</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container max-w-5xl py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-card/50 border-none shadow-sm">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Publikasi Terindeks</h3>
              <p className="text-muted-foreground text-sm">
                Karya Anda akan dipublikasikan dalam jurnal yang terkelola dengan standar akademik yang baik.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-none shadow-sm">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Editor Modern</h3>
              <p className="text-muted-foreground text-sm">
                Tulis artikel dengan mudah menggunakan editor teks modern yang kaya fitur dan user-friendly.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-none shadow-sm">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Sertifikat Penulis</h3>
              <p className="text-muted-foreground text-sm">
                Dapatkan pengakuan dan sertifikat untuk setiap kontribusi jurnal ilmiah yang diterbitkan.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form Section */}
        <div id="registration-form" className="max-w-3xl mx-auto scroll-mt-24">
          {!user ? (
            <Card className="border-t-4 border-t-primary shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Registrasi Akun Penulis Baru
                </CardTitle>
                <CardDescription>
                  Buat akun baru dan lengkapi profil penulis Anda dalam satu langkah mudah.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...newUserForm}>
                  <form onSubmit={newUserForm.handleSubmit(onNewUserSubmit)} className="space-y-6">
                    {/* Account Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Informasi Akun</h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={newUserForm.control}
                                name="firstName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Depan</FormLabel>
                                    <FormControl><Input placeholder="Nama Depan" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={newUserForm.control}
                                name="lastName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Belakang</FormLabel>
                                    <FormControl><Input placeholder="Nama Belakang (Opsional)" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={newUserForm.control}
                                name="email"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input type="email" placeholder="email@contoh.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={newUserForm.control}
                                name="phone"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nomor HP</FormLabel>
                                    <FormControl><Input placeholder="08xxxxxxxxxx" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                         <div className="grid gap-6 md:grid-cols-2">
                             <FormField
                                control={newUserForm.control}
                                name="password"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            {/* Username auto-generated */}
                        </div>
                    </div>

                    {/* Publication Profile Info */}
                    <div className="space-y-4 pt-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Profil Penulis</h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                            control={newUserForm.control}
                            name="institution"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Institusi / Afiliasi</FormLabel>
                                <FormControl>
                                    <Input placeholder="Contoh: UIN Sunan Kalijaga" {...field} />
                                </FormControl>
                                <FormDescription>Tempat Anda bekerja atau belajar.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                            <FormField
                            control={newUserForm.control}
                            name="whatsapp"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nomor WhatsApp (untuk Publikasi)</FormLabel>
                                <FormControl>
                                    <Input placeholder="0812xxxxxxxx" {...field} />
                                </FormControl>
                                <FormDescription>Kontak khusus komunikasi review artikel.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>

                        <FormField
                        control={newUserForm.control}
                        name="expertise"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Bidang Keahlian / Minat Studi</FormLabel>
                            <FormControl>
                                <Input placeholder="Contoh: Fiqih, Tafsir, Pendidikan, Sejarah" {...field} />
                            </FormControl>
                            <FormDescription>Pisahkan dengan koma jika lebih dari satu.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={newUserForm.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Bio Singkat (Opsional)</FormLabel>
                            <FormControl>
                                <Textarea 
                                placeholder="Ceritakan sedikit tentang latar belakang akademik Anda..." 
                                rows={3}
                                {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>

                    <div className="flex justify-end pt-4 gap-4 items-center">
                      <div className="text-sm text-muted-foreground">
                        Sudah punya akun? <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => navigate('/login', { state: { from: location } })}>Login disini</Button>
                      </div>
                      <Button type="submit" size="lg" disabled={isLoading} className="min-w-[150px]">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Daftar Akun
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-t-4 border-t-primary shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5 text-primary" />
                  Lengkapi Profil Penulis
                </CardTitle>
                <CardDescription>
                  Lengkapi data berikut untuk mengajukan akun penulis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6 bg-blue-50 border-blue-200">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Status Akun: Logged In</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Anda mendaftar sebagai <strong>{user.firstName} {user.lastName}</strong> ({user.email}).
                  </AlertDescription>
                </Alert>

                <Form {...existingUserForm}>
                  <form onSubmit={existingUserForm.handleSubmit(onExistingUserSubmit)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={existingUserForm.control}
                        name="institution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institusi / Afiliasi</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: UIN Sunan Kalijaga" {...field} />
                            </FormControl>
                            <FormDescription>Tempat Anda bekerja atau belajar.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={existingUserForm.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nomor WhatsApp</FormLabel>
                            <FormControl>
                              <Input placeholder="0812xxxxxxxx" {...field} />
                            </FormControl>
                            <FormDescription>Untuk komunikasi terkait review.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={existingUserForm.control}
                      name="expertise"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bidang Keahlian / Minat Studi</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Fiqih, Tafsir, Pendidikan, Sejarah" {...field} />
                          </FormControl>
                          <FormDescription>Pisahkan dengan koma jika lebih dari satu.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={existingUserForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio Singkat (Opsional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ceritakan sedikit tentang latar belakang akademik Anda..." 
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-4">
                      <Button type="submit" size="lg" disabled={isLoading} className="w-full md:w-auto">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Kirim Pendaftaran
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
