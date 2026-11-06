import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/shared/Logo';
interface DemoAccount {
  roleName: string;
  roleBadge: string;
  username: string;
  password: string;
  targetPath: string;
  description: string;
  icon: string;
  badgeColor: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    roleName: 'Admin CMS Profil',
    roleBadge: 'adminwebsite',
    username: 'adminwebsite',
    password: 'password123',
    targetPath: '/admin-cms',
    description: 'Kelola Konten Profil & Berita',
    icon: '🌐',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  },
  {
    roleName: 'Super Admin Mizan',
    roleBadge: 'SUPER_ADMIN',
    username: 'admin',
    password: 'password123',
    targetPath: '/admin/dashboard',
    description: 'Sistem Inti Akademik & Absensi',
    icon: '🛡️',
    badgeColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
  },
  {
    roleName: 'Dewan Guru Pengajar',
    roleBadge: 'GURU',
    username: 'nirwan',
    password: 'password123',
    targetPath: '/guru/dashboard',
    description: 'Input Nilai & Jurnal Mengajar',
    icon: '📚',
    badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  },
  {
    roleName: 'Pembina BK / Pengasuhan',
    roleBadge: 'PENGASUHAN',
    username: 'doli',
    password: 'password123',
    targetPath: '/bk/dashboard',
    description: 'Pelanggaran & Izin Santri',
    icon: '🕌',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  },
  {
    roleName: 'Petugas Pos Satpam',
    roleBadge: 'SATPAM',
    username: 'satpam',
    password: 'password123',
    targetPath: '/satpam',
    description: 'Pencatatan Gerbang Keamanan',
    icon: '👮',
    badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
  },
  {
    roleName: 'Wali Santri / Orang Tua',
    roleBadge: 'ORTU',
    username: 'ortu',
    password: 'password123',
    targetPath: '/ortu/dashboard',
    description: 'Rapor, Absensi & Tagihan Santri',
    icon: '👨‍👩‍👧',
    badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  },
  {
    roleName: 'Santri / Pelajar',
    roleBadge: 'santri',
    username: 'santri',
    password: 'password123',
    targetPath: '/santri/dashboard',
    description: 'Jadwal Harian & Hafalan Quran',
    icon: '🎓',
    badgeColor: 'bg-teal-500/10 text-teal-500 border-teal-500/30',
  },
  {
    roleName: 'Penulis Warta Pondok',
    roleBadge: 'author',
    username: 'penulis',
    password: 'password123',
    targetPath: '/author/dashboard',
    description: 'Publikasi Berita & Jurnal Ilmiah',
    icon: '✍️',
    badgeColor: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [location.pathname]);
  useEffect(() => {
    if (useAuthStore.getState().isAuthenticated) {
      const user = useAuthStore.getState().user;
      if (!user) return;
      const rawRole = (user.role || '').toString();
      const role = rawRole.toLowerCase();

      if (role === 'adminwebsite') {
        window.location.href = '/admin-cms';
        return;
      }
      if (rawRole === 'SUPER_ADMIN' || role === 'super_admin' || role === 'superadmin' || role === 'admin') {
        window.location.href = '/admin/dashboard';
        return;
      }
      if (role === 'staff' || role === 'petugaspendaftaran') {
        window.location.href = '/admin-cms';
        return;
      }
      if (rawRole === 'PENGASUHAN' || role === 'pengasuhan') {
        window.location.href = '/bk/dashboard';
        return;
      }
      if (rawRole === 'GURU' || role === 'guru') {
        window.location.href = '/guru/dashboard';
        return;
      }
      if (rawRole === 'SATPAM' || role === 'satpam') {
        window.location.href = '/satpam';
        return;
      }
      if (rawRole === 'ORTU' || role === 'ortu') {
        window.location.href = '/ortu/dashboard';
        return;
      }
      if ((user.publicationStatus && user.publicationStatus !== 'none') || role === 'author') {
        navigate('/author/dashboard', { replace: true });
        return;
      }
      if (role === 'santri' || role === 'user') {
        const identifier = user.username || user.id;
        navigate(`/santri/dashboard/${identifier}`, { replace: true });
        return;
      }
      window.location.href = '/admin-cms';
    }
  }, [navigate]);
  const handleLogin = async (e?: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const u = customUser || username;
    const p = customPass || password;
    if (!u || !p) {
      toast.error('Username dan password wajib diisi');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { username: u, password: p });
      const { user, token } = response.data;
      if (!user) {
        toast.error('Data pengguna tidak ditemukan');
        return;
      }
      setAuth(user, token);
      toast.success(`Selamat datang kembali, ${user.name || user.firstName || user.username}!`);
      await new Promise((r) => setTimeout(r, 600));

      const rawRole = (user.role || '').toString();
      const role = rawRole.toLowerCase();

      if (role === 'adminwebsite') {
        window.location.href = '/admin-cms';
        return;
      }
      if (rawRole === 'SUPER_ADMIN' || role === 'super_admin' || role === 'superadmin' || role === 'admin') {
        window.location.href = '/admin/dashboard';
        return;
      }
      if (role === 'staff' || role === 'petugaspendaftaran') {
        window.location.href = '/admin-cms';
        return;
      }
      if (rawRole === 'PENGASUHAN' || role === 'pengasuhan') {
        window.location.href = '/bk/dashboard';
        return;
      }
      if (rawRole === 'GURU' || role === 'guru') {
        window.location.href = '/guru/dashboard';
        return;
      }
      if (rawRole === 'SATPAM' || role === 'satpam') {
        window.location.href = '/satpam';
        return;
      }
      if (rawRole === 'ORTU' || role === 'ortu') {
        if (user.santriId) {
          try {
            localStorage.setItem('mizan_ortu_santri_id', user.santriId);
          } catch {
            void 0;
          }
        }
        window.location.href = '/ortu/dashboard';
        return;
      }
      if ((user.publicationStatus && user.publicationStatus !== 'none') || role === 'author') {
        navigate('/author/dashboard', { replace: true });
        return;
      }
      if (role === 'santri' || role === 'user') {
        const identifier = user.username || user.id;
        navigate(`/santri/dashboard/${identifier}`, { replace: true });
        return;
      }
      window.location.href = '/admin-cms';
    } catch (error: unknown) {
      const message = (error as any)?.response?.data?.error || 'Login gagal. Periksa kredensial Anda.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const nameParts = regName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';
        await api.post('/auth/register', {
            username: regEmail, 
            email: regEmail,
            password: regPassword,
            firstName,
            lastName,
            phone: regPhone,
            role: 'santri' 
        });
        toast.success('Pendaftaran berhasil! Silakan login.');
        setActiveTab('login');
        setUsername(regEmail);
        navigate('/login');
    } catch (error: unknown) {
        const message = (error as any)?.response?.data?.error || 'Gagal mendaftar. Silakan coba lagi.';
        toast.error(message);
    } finally {
        setIsLoading(false);
    }
  };
  const fillDemoLogin = (acc: DemoAccount, autoSubmit = false) => {
    setUsername(acc.username);
    setPassword(acc.password);
    toast.success(`Akun ${acc.roleName} dipilih`);
    if (autoSubmit) {
      handleLogin(undefined, acc.username, acc.password);
    }
  };
  const toggleTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    navigate(tab === 'login' ? '/login' : '/register');
  };
  return (
    <div className="flex min-h-screen bg-background">
      {}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
        <div className="relative z-10 p-12 text-white max-w-lg">
          <Logo variant="icon" iconClassName="w-16 h-16 mb-8 rounded-[4px] border border-border" />
          <h2 className="text-4xl font-bold mb-6 leading-tight">Membangun Generasi <br/><span className="text-primary">Berakhlak Mulia</span></h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            Platform manajemen pesantren modern yang terintegrasi. Memudahkan administrasi, pemantauan akademik, dan komunikasi dengan wali santri.
          </p>
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-4">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs">
                    <img src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} className="w-full h-full rounded-full" alt="" />
                 </div>
               ))}
            </div>
            <div className="text-sm">
              <span className="font-bold text-white">1,000+</span> Santri & Wali Santri
            </div>
          </div>
        </div>
      </div>
      {}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 bg-background relative">
        <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="w-full max-w-md space-y-8"
        >
          {}
          <div className="absolute top-4 left-4 lg:top-8 lg:left-8">
             <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
          </div>
          <div className="text-center lg:text-left">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2.5 mb-8">
              <Logo variant="icon" iconClassName="w-10 h-10" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
                {activeTab === 'login' ? 'Selamat Datang' : 'Buat Akun Baru'}
            </h1>
            <p className="text-muted-foreground mt-2">
                {activeTab === 'login' 
                    ? 'Masuk untuk mengakses dashboard Anda' 
                    : 'Daftarkan diri Anda untuk memulai'}
            </p>
          </div>
          {}
          <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/50 rounded-xl">
            <button
                onClick={() => toggleTab('login')}
                className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'login' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                Masuk
            </button>
            <button
                onClick={() => toggleTab('register')}
                className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'register' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                Daftar
            </button>
          </div>
          <div className="space-y-6">
             {}
             <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all duration-200"
                onClick={() => toast.info('Fitur Login Google akan segera tersedia')}
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                {activeTab === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google'}
            </button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex-1 h-px bg-border"></div>
                <span>atau dengan email</span>
                <div className="flex-1 h-px bg-border"></div>
            </div>
            <AnimatePresence mode="wait">
                {activeTab === 'login' ? (
                    <motion.form 
                        key="login-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleLogin} 
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Username / Email</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 text-sm rounded-xl bg-secondary/30 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                placeholder="Masukkan username atau email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium">Password</label>
                                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">Lupa Password?</Link>
                            </div>
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    className="w-full px-4 py-3 pr-10 text-sm rounded-xl bg-secondary/30 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 mt-2"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                            {isLoading ? 'Masuk...' : 'Masuk'}
                        </button>
                    </motion.form>
                ) : (
                    <motion.form 
                        key="register-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleRegister} 
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nama Lengkap</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 text-sm rounded-xl bg-secondary/30 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                placeholder="Masukkan nama lengkap"
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <input 
                                type="email" 
                                className="w-full px-4 py-3 text-sm rounded-xl bg-secondary/30 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                placeholder="email@contoh.com"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">No. WhatsApp</label>
                            <input 
                                type="tel" 
                                className="w-full px-4 py-3 text-sm rounded-xl bg-secondary/30 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                placeholder="08xxxxxxxxxx"
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    className="w-full px-4 py-3 pr-10 text-sm rounded-xl bg-secondary/30 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                    placeholder="Min. 8 karakter" 
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 mt-2"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            {isLoading ? 'Mendaftar...' : 'Buat Akun'}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
            {}
            {activeTab === 'login' && (
                <div className="mt-6 pt-5 border-t border-dashed border-border/80">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-semibold text-foreground">
                                Mode Development — Dummy Login
                            </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                            {DEMO_ACCOUNTS.length} Akun
                        </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-3">
                        Pilih role akun di bawah untuk auto-fill atau klik <strong>Masuk ➔</strong> untuk login instan:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                        {DEMO_ACCOUNTS.map((acc) => (
                            <div
                                key={acc.username}
                                className="flex flex-col justify-between p-2.5 rounded-xl border border-border bg-card/70 hover:bg-secondary/60 hover:border-primary/40 transition-all text-xs"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                                            <span>{acc.icon}</span>
                                            <span className="truncate">{acc.roleName}</span>
                                        </span>
                                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${acc.badgeColor} shrink-0`}>
                                            {acc.roleBadge}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground mb-2 truncate">
                                        {acc.description}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                                    <span className="font-mono text-muted-foreground text-[10px]">
                                        user: <strong className="text-foreground">{acc.username}</strong>
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => fillDemoLogin(acc, false)}
                                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                                            disabled={isLoading}
                                        >
                                            Isi Form
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => fillDemoLogin(acc, true)}
                                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                            disabled={isLoading}
                                        >
                                            Masuk ➔
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}