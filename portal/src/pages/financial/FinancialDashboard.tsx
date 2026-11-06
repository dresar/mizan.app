import { PageHeader } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Users
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
export default function FinancialDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['financial-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    },
  });
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const chartData = stats?.financialStats?.map((item: any) => ({
    name: item.name,
    income: Number(item.total),
    expense: 0,
  })) || [];
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard Keuangan"
        description="Ringkasan dan analisis keuangan pesantren"
        icon={Wallet}
      />
      {}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pemasukan terverifikasi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pembayaran Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingPayments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Menunggu verifikasi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pembayaran Terverifikasi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.verifiedPayments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Transaksi berhasil
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Santri Lunas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.acceptedSantri || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Santri yang telah diterima
            </p>
          </CardContent>
        </Card>
      </div>
      {}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Arus Kas (6 Bulan Terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `Rp${value / 1000000}jt`} 
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Statistik Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium">Uang Pangkal</span>
                   </div>
                   <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                   <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }} />
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium">SPP Bulanan</span>
                   </div>
                   <span className="text-sm text-muted-foreground">30%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                   <div className="bg-blue-500 h-full rounded-full" style={{ width: '30%' }} />
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="text-sm font-medium">Donasi</span>
                   </div>
                   <span className="text-sm text-muted-foreground">15%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                   <div className="bg-yellow-500 h-full rounded-full" style={{ width: '15%' }} />
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <span className="text-sm font-medium">Lainnya</span>
                   </div>
                   <span className="text-sm text-muted-foreground">10%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                   <div className="bg-purple-500 h-full rounded-full" style={{ width: '10%' }} />
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}