import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, CreditCard, ArrowRight, Check, AlertCircle, Shirt, ListOrdered } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
import { formatCurrency } from '@/lib/utils';
import { RegistrationFlowItem, SeragamItem } from '@/types';
interface Requirement {
  id: number;
  persyaratanSantri: string;
  persyaratanSantriwati: string;
}
interface Fee {
  id: number;
  nama: string;
  jumlah: number;
  keterangan?: string;
  tipe: string;
}
const PendaftaranPage = () => {
  const { data: requirements, isLoading: reqLoading } = usePublicData<Requirement>(['requirements'], '/core/persyaratan');
  const { data: fees, isLoading: feesLoading } = usePublicData<Fee[]>(['fees'], '/core/biaya-pendidikan');
  const { data: flow, isLoading: flowLoading } = usePublicData<RegistrationFlowItem[]>(['registration-flow'], '/core/registration-flow');
  const { data: uniforms, isLoading: uniformsLoading } = usePublicData<SeragamItem[]>(['seragam'], '/core/seragam');
  const reqList = requirements?.persyaratanSantri ? requirements.persyaratanSantri.split('\n').filter(Boolean) : [];
  const totalFee = fees?.reduce((sum, fee) => sum + fee.jumlah, 0) || 0;
  return (
    <>
      <PageHeader title="Pendaftaran Santri Baru" subtitle="Informasi lengkap pendaftaran Tahun Ajaran 2025/2026." breadcrumbs={[{ label: 'Pendaftaran' }]} />
      {}
      <div className="container mx-auto max-w-7xl px-4 mt-8">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-primary">Pendaftaran Dibuka!</p>
            <p className="text-sm text-muted-foreground mt-0.5">Periode pendaftaran: 1 Januari - 30 Juni 2026. Kuota terbatas!</p>
          </div>
        </div>
      </div>
      <SectionWrapper>
        {}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <ListOrdered className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold">Alur Pendaftaran</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {}
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-border -z-10 mx-16" />
            {flowLoading ? (
               [1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />)
            ) : (
              flow?.filter(f => f.isActive).sort((a, b) => a.order - b.order).map((step, i) => {
                const Icon = LucideIcons[step.icon] || LucideIcons.CircleDot;
                return (
                  <motion.div 
                    key={step.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }} 
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-6 text-center relative group hover-lift"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:border-primary/50 transition-colors z-10 relative">
                      <Icon className="w-8 h-8 text-primary" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                        {i + 1}
                      </div>
                    </div>
                    <h4 className="font-semibold mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </motion.div>
                );
              })
            )}
            {(!flow || flow.length === 0) && !flowLoading && (
               <div className="col-span-full text-center py-8 text-muted-foreground">Belum ada data alur pendaftaran.</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Persyaratan</h3>
            </div>
            <div className="space-y-3">
              {reqLoading ? (
                 [1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)
              ) : (
                reqList.length > 0 ? reqList.map((req, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{req}</p>
                    </div>
                  </motion.div>
                )) : <p className="text-muted-foreground">Belum ada data persyaratan.</p>
              )}
            </div>
          </motion.div>
          {}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Rincian Biaya</h3>
            </div>
            <div className="space-y-2">
              {feesLoading ? (
                 [1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />)
              ) : (
                fees?.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <span className="text-sm">{f.nama}</span>
                    <span className="text-sm font-semibold text-primary">{formatCurrency(f.jumlah)}</span>
                  </div>
                ))
              )}
              <div className="flex items-center justify-between p-3 rounded-lg gradient-primary text-primary-foreground mt-2">
                <span className="text-sm font-semibold">Total Estimasi</span>
                <span className="text-sm font-bold">{formatCurrency(totalFee)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">*Biaya dapat berubah sewaktu-waktu. Hubungi kami untuk informasi terbaru.</p>
          </motion.div>
        </div>
        {}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Shirt className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold">Informasi Seragam</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {uniformsLoading ? (
               [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />)
            ) : (
              uniforms?.sort((a, b) => a.order - b.order).map((u, i) => (
                <motion.div 
                  key={u.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: i * 0.1 }}
                  className="glass-card overflow-hidden group hover-lift"
                >
                  <div className="p-4 bg-muted/30 border-b font-semibold text-center">
                    {u.hari}
                  </div>
                  <div className="p-4 space-y-4">
                    {}
                    <div className="flex items-start gap-3">
                       <div className="w-12 h-12 rounded-lg bg-muted shrink-0 overflow-hidden border">
                         {u.gambarPutra ? (
                           <img src={u.gambarPutra} alt="Seragam Putra" className="w-full h-full object-cover" />
                         ) : <Shirt className="w-6 h-6 m-auto text-muted-foreground/50" />}
                       </div>
                       <div>
                         <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Putra</span>
                         <p className="text-sm line-clamp-2">{u.seragamPutra}</p>
                       </div>
                    </div>
                    {}
                    <div className="flex items-start gap-3 pt-4 border-t border-dashed">
                       <div className="w-12 h-12 rounded-lg bg-muted shrink-0 overflow-hidden border">
                         {u.gambarPutri ? (
                           <img src={u.gambarPutri} alt="Seragam Putri" className="w-full h-full object-cover" />
                         ) : <Shirt className="w-6 h-6 m-auto text-muted-foreground/50" />}
                       </div>
                       <div>
                         <span className="text-xs font-bold text-pink-500 uppercase tracking-wider block mb-1">Putri</span>
                         <p className="text-sm line-clamp-2">{u.seragamPutri}</p>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
             {(!uniforms || uniforms.length === 0) && !uniformsLoading && (
               <div className="col-span-full text-center py-8 text-muted-foreground">Belum ada data seragam.</div>
            )}
          </div>
        </div>
        {}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Siap Mendaftar?</h3>
          <p className="text-muted-foreground mb-6">Buat akun untuk memulai proses pendaftaran online.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl gradient-primary text-primary-foreground">
              Daftar Online <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/kontak" className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold rounded-xl border border-border text-foreground hover:bg-secondary transition-colors">
              Hubungi Kami
            </Link>
          </div>
        </motion.div>
      </SectionWrapper>
    </>
  );
};
export default PendaftaranPage;