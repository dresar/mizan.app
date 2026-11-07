import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/shared/Logo';
import { ALL_DEMO_USERS, DemoUser } from '@/data/demo-accounts';

const getRoleBadgeStyle = (role: string) => {
  switch (role) {
    case 'adminwebsite':
      return { label: 'CMS Profil', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' };
    case 'SUPER_ADMIN':
      return { label: 'Super Admin', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30' };
    case 'GURU':
      return { label: 'Guru', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' };
    case 'PENGASUHAN':
      return { label: 'Pengasuhan/BK', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' };
    case 'SATPAM':
      return { label: 'Satpam', color: 'bg-rose-500/10 text-rose-500 border-rose-500/30' };
    case 'ORTU':
      return { label: 'Wali Santri', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' };
    case 'santri':
      return { label: 'Santri', color: 'bg-teal-500/10 text-teal-500 border-teal-500/30' };
    case 'author':
      return { label: 'Penulis', color: 'bg-orange-500/10 text-orange-500 border-orange-500/30' };
    default:
      return { label: role, color: 'bg-secondary text-foreground border-border' };
  }
};

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
  const [searchDemo, setSearchDemo] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'GURU' | 'PENGASUHAN' | 'OTHER'>('ALL');
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
        window.location.href = 'https://mizan.agentai.my.id/admin/dashboard';
        return;
      }
      if (role === 'staff' || role === 'petugaspendaftaran') {
        window.location.href = '/admin-cms';
        return;
      }
      if (rawRole === 'PENGASUHAN' || role === 'pengasuhan') {
        window.location.href = 'https://mizan.agentai.my.id/bk/dashboard';
        return;
      }
      if (rawRole === 'GURU' || role === 'guru') {
        window.location.href = 'https://mizan.agentai.my.id/guru/dashboard';
        return;
      }
      if (rawRole === 'SATPAM' || role === 'satpam') {
        window.location.href = 'https://mizan.agentai.my.id/satpam';
        return;
      }
      if (rawRole === 'ORTU' || role === 'ortu') {
        window.location.href = 'https://mizan.agentai.my.id/ortu/dashboard';
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
  const fillDemoLogin = (user: DemoUser, autoSubmit = false) => {
    setUsername(user.username);
    setPassword('password123');
    toast.success(`Akun ${user.name} dipilih (@${user.username})`);
    if (autoSubmit) {
      handleLogin(undefined, user.username, 'password123');
    }
  };
  const filteredDemoUsers = ALL_DEMO_USERS.filter((u) => {
    if (!searchDemo.trim()) return true;
    const q = searchDemo.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.roleTitle || '').toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });
  const toggleTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    navigate(tab === 'login' ? '/login' : '/register');
  };
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-background relative overflow-y-auto">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-lg space-y-6 my-8"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center mb-3">
            <Logo variant="icon" iconClassName="w-12 h-12 rounded-xl shadow-lg shadow-primary/20" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {activeTab === 'login' ? 'Selamat Datang' : 'Buat Akun Baru'}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1.5">
            {activeTab === 'login' 
              ? 'Masuk untuk mengakses portal pesantren & sistem akademik' 
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
                <div className="mt-8 pt-6 border-t border-dashed border-border/80">
                    <div className="p-3.5 mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-0.5 text-left">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs font-bold text-foreground">Sistem Mizan (Guru, BK, Satpam, Wali)</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Portal penilaian sikap, sholat, dan perizinan berada di subdomain khusus Mizan.
                            </p>
                        </div>
                        <a
                            href="https://mizan.agentai.my.id/login"
                            className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1"
                        >
                            Ke Mizan ➔
                        </a>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-xs sm:text-sm font-semibold text-foreground">
                                Akun Demo Portal & CMS Website
                            </span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                            Pass: password123
                        </span>
                    </div>

                    <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                        {filteredDemoUsers.length === 0 ? (
                            <div className="text-center py-6 text-xs text-muted-foreground">
                                Tidak ada akun yang cocok dengan pencarian "{searchDemo}"
                            </div>
                        ) : (
                            filteredDemoUsers.map((user) => {
                                const badge = getRoleBadgeStyle(user.role);
                                return (
                                    <div
                                        key={user.username}
                                        className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card/70 hover:bg-secondary/60 hover:border-primary/40 transition-all text-xs gap-2"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="font-semibold text-foreground truncate">{user.name}</span>
                                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${badge.color} shrink-0`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
                                                <span className="font-mono text-primary font-medium">@{user.username}</span>
                                                {user.roleTitle && (
                                                    <span className="truncate text-muted-foreground/80">• {user.roleTitle}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => fillDemoLogin(user, false)}
                                                className="px-2 py-1 rounded-md text-[10px] font-medium bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                                                disabled={isLoading}
                                            >
                                                Isi Form
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => fillDemoLogin(user, true)}
                                                className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                                disabled={isLoading}
                                            >
                                                Masuk ➔
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
          </div>
        </motion.div>
    </div>
  );
}