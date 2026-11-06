import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api'; 
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Lock, Save, Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';
export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || '',
    avatar: user?.avatar || '',
  });
  const getAvatarUrl = () => {
    if (profileData.avatar) return profileData.avatar;
    return `https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&background=0ea5e9&color=fff&size=128`;
  };
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newAvatar = getAvatarUrl();
      const updatedData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        username: profileData.username,
        avatar: newAvatar,
      };
      await api.put('/users/me', updatedData);
      updateUser(updatedData);
      setProfileData(prev => ({ ...prev, avatar: newAvatar }));
      toast.success('Profil berhasil diperbarui');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Gagal memperbarui profil');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Password berhasil diubah');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 1000);
  };
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi akun dan keamanan"
        icon={User}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 mx-auto border-4 border-background shadow-lg">
                  <AvatarImage src={getAvatarUrl()} alt={profileData.username} />
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                    {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h3 className="text-xl font-bold">{profileData.firstName} {profileData.lastName}</h3>
                <p className="text-sm text-muted-foreground">@{profileData.username}</p>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                  {user?.role || 'User'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {}
        <div className="md:col-span-2 space-y-6">
          {}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pribadi</CardTitle>
              <CardDescription>Perbarui detail profil Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="avatar">URL Foto Profil (CDN)</Label>
                  <Input 
                    id="avatar" 
                    name="avatar" 
                    value={profileData.avatar} 
                    onChange={handleProfileChange} 
                    placeholder="https://..."
                  />
                  <p className="text-[10px] text-muted-foreground">Masukkan link gambar dari CDN (contoh: gravatar, imgur, dll)</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nama Depan</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={profileData.firstName} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nama Belakang</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={profileData.lastName} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    name="username" 
                    value={profileData.username} 
                    onChange={handleProfileChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={profileData.email} 
                    onChange={handleProfileChange} 
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          {}
          <Card>
            <CardHeader>
              <CardTitle>Ganti Password</CardTitle>
              <CardDescription>Amankan akun Anda dengan password yang kuat</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Password Saat Ini</Label>
                  <Input 
                    id="currentPassword" 
                    name="currentPassword" 
                    type="password" 
                    value={passwordData.currentPassword} 
                    onChange={handlePasswordChange} 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <Input 
                      id="newPassword" 
                      name="newPassword" 
                      type="password" 
                      value={passwordData.newPassword} 
                      onChange={handlePasswordChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password" 
                      value={passwordData.confirmPassword} 
                      onChange={handlePasswordChange} 
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="outline" disabled={isLoading}>
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}