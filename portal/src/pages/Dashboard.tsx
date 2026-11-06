import React from 'react';
import {
  GraduationCap,
  CreditCard,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Users,
  Settings,
  PlusCircle,
  Bell,
  MoreHorizontal
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = format(currentTime, 'HH:mm:ss', { locale: id });
  const formattedDate = format(currentTime, 'EEEE, d MMMM yyyy', { locale: id });

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    },
    refetchInterval: 300000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="h-10 w-48 bg-muted animate-pulse rounded-[4px]" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-[4px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-[4px]" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-[4px]" />
      </div>
    );
  }

  const totalSantri = stats?.totalSantri || 0;
  const pendingPayments = stats?.pendingPayments || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const pendingVerifications = stats?.pendingVerifications || [];
  const genderDistribution = stats?.genderDistribution || [];
  const registrationStats = stats?.registrationStats || [];
  const financialTrend = stats?.financialStats?.map((item: any) => ({
    name: item.name,
    income: item.total,
    expense: 0,
  })) || [];

  return (
    <div className="space-y-6 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[4px] border border-border bg-card p-6 md:p-8 card card--accent">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
              Selamat datang kembali di Panel Administrasi Pesantren Hub. Pantau seluruh aktivitas dan perkembangan santri secara real-time.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1">
            <div className="flex items-center gap-2 bg-muted/50 p-2.5 rounded-[4px] border border-border">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span className="text-lg font-mono font-semibold tracking-wider text-foreground">{formattedTime}</span>
            </div>
            <div className="text-muted-foreground text-xs font-medium">{formattedDate}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCardPro
          title="Total Santri"
          value={totalSantri}
          icon={GraduationCap}
          trend="+12%"
          trendUp={true}
          description="Sejak bulan lalu"
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatsCardPro
          title="Keuangan Masuk"
          value={`Rp ${totalRevenue.toLocaleString()}`} 
          icon={Wallet}
          trend="+8.2%"
          trendUp={true}
          description="Total pemasukan bulan ini"
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatsCardPro
          title="Menunggu Verifikasi"
          value={pendingPayments}
          icon={Clock}
          trend="-2%"
          trendUp={false} 
          description="Pembayaran pending"
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatsCardPro
          title="Total Pengguna"
          value={stats?.totalUsers || 0}
          icon={Users}
          trend="+4"
          trendUp={true}
          description="User aktif sistem"
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tambah Santri', icon: PlusCircle, color: 'text-emerald-500', link: '/admin/admissions/new' },
          { label: 'Verifikasi Pembayaran', icon: CheckCircle, color: 'text-emerald-500', link: '/admin/payments' },
          { label: 'Buat Pengumuman', icon: Bell, color: 'text-amber-500', link: '/admin/announcements' },
          { label: 'Pengaturan Sistem', icon: Settings, color: 'text-foreground', link: '/admin/settings' },
        ].map((action, i) => (
          <a 
            key={i} 
            href={action.link}
            className="flex items-center gap-3 p-4 rounded-[4px] border border-border bg-card hover:bg-muted/40 transition-colors min-h-[44px] card"
          >
            <div className={cn("p-2 rounded-[4px] bg-muted", action.color)}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="font-medium text-sm text-foreground">{action.label}</span>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-4 rounded-[4px] border border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold">Arus Kas Keuangan</CardTitle>
                <CardDescription>Pemasukan vs Pengeluaran (6 Bulan Terakhir)</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0">
                Download Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={financialTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `Rp${value/1000000}M`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '4px', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => `Rp ${value.toLocaleString()}`}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Area type="monotone" dataKey="income" name="Pemasukan" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="rounded-[4px] border border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Distribusi Santri</CardTitle>
              <CardDescription>Berdasarkan Jenis Kelamin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={genderDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genderDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '4px', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="text-3xl font-bold block text-foreground">{totalSantri}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-6">
                {genderDistribution.map((item: any, index: number) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className="text-sm text-muted-foreground">({item.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[4px] border border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Statistik Pendaftaran</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              </div>
              <CardDescription>Tren pendaftaran santri baru</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={registrationStats}>
                    <XAxis dataKey="name" hide />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '4px', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="total" fill="#10b981" radius={[2, 2, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-[4px] border border-border h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Aktivitas Terbaru</CardTitle>
                <CardDescription>Log aktivitas sistem terkini</CardDescription>
              </div>
              <Button variant="ghost" size="icon" aria-label="More options">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                  <Avatar className="h-9 w-9 rounded-[4px]">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=User+${i}&background=10b981&color=fff`} />
                    <AvatarFallback className="rounded-[4px]">U{i}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">
                      User {i} melakukan update pada <span className="text-emerald-500">Data Santri</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {i * 5 + 2} menit yang lalu
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[4px] border border-border h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Menunggu Verifikasi</CardTitle>
                <CardDescription>Pembayaran yang perlu dicek</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/admin/payments">Lihat Semua</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingVerifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mb-2 text-muted-foreground/30" />
                  <p>Semua pembayaran telah diverifikasi</p>
                </div>
              ) : (
                pendingVerifications.slice(0, 4).map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-[4px] border border-border hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-[4px] bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{payment.santri?.namaLengkap}</p>
                        <p className="text-xs text-muted-foreground">Rp {Number(payment.jumlahTransfer).toLocaleString()}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="min-h-[44px] sm:min-h-0" asChild>
                      <a href={`/admin/payments/${payment.id}`}>Detail</a>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCardPro({ title, value, icon: Icon, trend, trendUp, description, color, bg }: any) {
  return (
    <Card className="card rounded-[4px] border border-border p-5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
            <span className={cn("flex items-center text-xs font-medium", trendUp ? "text-emerald-500" : "text-rose-500")}>
              {trendUp ? <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" /> : <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />}
              {trend}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px]", bg, color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
