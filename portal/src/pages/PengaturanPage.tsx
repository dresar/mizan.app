import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Palette, Camera, Loader2, Save } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const sections = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'tema', label: 'Tema', icon: Palette },
];
const PengaturanPage = () => {
  const [activeSection, setActiveSection] = useState('profil');
  const { theme, setTheme } = useTheme();
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    avatar: '',
  });
  const [emailData, setEmailData] = useState({
    currentEmail: '',
    newEmail: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
      setEmailData(prev => ({ ...prev, currentEmail: user.email || '' }));
    }
  }, [user]);
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailData({ ...emailData, [e.target.name]: e.target.value });
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await api.put('/users/me', profileData);
      updateUser(profileData);
      toast.success('Profil berhasil diperbarui');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal memperbarui profil');
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateEmail = async () => {
    if (!emailData.newEmail) return toast.error('Email baru harus diisi');
    setIsLoading(true);
    try {
      await api.put('/users/me', { email: emailData.newEmail });
      updateUser({ email: emailData.newEmail });
      toast.success('Email berhasil diperbarui');
      setEmailData(prev => ({ ...prev, currentEmail: emailData.newEmail, newEmail: '' }));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal memperbarui email');
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      return toast.error('Semua field password harus diisi');
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Konfirmasi password tidak cocok');
    }
    setIsLoading(true);
    try {
      await api.put('/users/me/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password berhasil diperbarui');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal memperbarui password');
    } finally {
      setIsLoading(false);
    }
  };
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Ukuran file maksimal 2MB');
    }
    const formData = new FormData();
    formData.append('file', file);
    const toastId = toast.loading('Mengupload foto...');
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newAvatarUrl = res.data.url;
      await api.put('/users/me', { ...profileData, avatar: newAvatarUrl });
      updateUser({ avatar: newAvatarUrl });
      setProfileData(prev => ({ ...prev, avatar: newAvatarUrl }));
      toast.success('Foto profil berhasil diperbarui', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengupload foto', { id: toastId });
    }
  };
  const getAvatarUrl = () => {
    if (profileData.avatar) return profileData.avatar;
    return `https://ui-avatars.com/api/?name=${profileData.firstName || 'U'}+${profileData.lastName || 'ser'}&background=0ea5e9&color=fff&size=128`;
  };
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Pengaturan Akun</h1>
        <p className="text-sm text-muted-foreground mb-6">Kelola profil dan preferensi akun Anda.</p>
        {}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === s.id
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </div>
        {}
        {activeSection === 'profil' && (
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                  <AvatarImage src={getAvatarUrl()} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors"
                  title="Ganti Foto"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>
              <div>
                <h3 className="font-bold text-lg">{profileData.firstName} {profileData.lastName}</h3>
                <p className="text-sm text-muted-foreground">@{profileData.username}</p>
                <p className="text-xs text-muted-foreground mt-1">{user?.role === 'santri' ? 'Santri' : 'User'}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Nama Depan</label>
                <input
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Nama Belakang</label>
                <input
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Username</label>
                <input
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">No. Telepon</label>
                <input
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="08..."
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <button 
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Perubahan
            </button>
          </div>
        )}
        {}
        {activeSection === 'email' && (
          <div className="glass-card p-6 space-y-5">
            <div>
              <label className="text-xs text-muted-foreground">Email Saat Ini</label>
              <input 
                readOnly 
                value={emailData.currentEmail} 
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-secondary/30 border border-border text-sm text-muted-foreground" 
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email Baru</label>
              <input 
                name="newEmail"
                type="email" 
                value={emailData.newEmail}
                onChange={handleEmailChange}
                placeholder="Masukkan email baru" 
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" 
              />
            </div>
            <button 
              onClick={handleUpdateEmail}
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update Email
            </button>
          </div>
        )}
        {}
        {activeSection === 'password' && (
          <div className="glass-card p-6 space-y-5">
            <div>
              <label className="text-xs text-muted-foreground">Password Lama</label>
              <input 
                type="password" 
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••" 
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" 
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Password Baru</label>
              <input 
                type="password" 
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••" 
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" 
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Konfirmasi Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••" 
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" 
              />
            </div>
            <button 
              onClick={handleUpdatePassword}
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Ubah Password
            </button>
          </div>
        )}
        {}
        {activeSection === 'tema' && (
          <div className="glass-card p-6">
            <p className="text-sm text-muted-foreground mb-4">Pilih tema tampilan aplikasi.</p>
            <div className="grid grid-cols-3 gap-3">
              {([['light', 'Terang'], ['dark', 'Gelap'], ['system', 'Sistem']] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`p-4 rounded-xl border text-center text-sm font-medium transition-colors ${
                    theme === value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
export default PengaturanPage;