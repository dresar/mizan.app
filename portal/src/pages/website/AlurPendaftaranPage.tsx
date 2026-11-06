import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, ClipboardList, CreditCard, UserCheck, GraduationCap, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
import { Link } from 'react-router-dom';
const defaultSteps = [
  {
    id: 1,
    title: 'Buat Akun',
    description: 'Daftarkan akun baru menggunakan email dan nomor WhatsApp yang aktif.',
    icon: 'UserCheck',
    order: 1
  },
  {
    id: 2,
    title: 'Isi Formulir',
    description: 'Lengkapi data diri, data orang tua, dan riwayat pendidikan.',
    icon: 'ClipboardList',
    order: 2
  },
  {
    id: 3,
    title: 'Pembayaran',
    description: 'Lakukan pembayaran biaya pendaftaran melalui transfer bank.',
    icon: 'CreditCard',
    order: 3
  },
  {
    id: 4,
    title: 'Verifikasi & Tes',
    description: 'Tunggu verifikasi dokumen dan ikuti tes seleksi masuk.',
    icon: 'FileText',
    order: 4
  },
  {
    id: 5,
    title: 'Pengumuman',
    description: 'Cek status kelulusan di dashboard akun Anda.',
    icon: 'GraduationCap',
    order: 5
  },
  {
    id: 6,
    title: 'Daftar Ulang',
    description: 'Lakukan daftar ulang jika dinyatakan lulus.',
    icon: 'CheckCircle2',
    order: 6
  }
];
const iconMap: any = {
  UserCheck,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  CheckCircle2,
  ArrowRight
};
export default function AlurPendaftaranPage() {
  const { data: flowData, isLoading } = usePublicData<any[]>(['registration-flow'], '/core/registration-flow');
  const steps = flowData && flowData.length > 0 ? flowData : defaultSteps;
  return (
    <>
      <PageHeader
        title="Alur Pendaftaran"
        subtitle="Panduan langkah demi langkah proses pendaftaran santri baru"
        breadcrumbs={[{ label: 'Pendaftaran', href: '/pendaftaran' }, { label: 'Alur Pendaftaran' }]}
      />
      <SectionWrapper>
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {}
            <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block" />
            <div className="absolute left-[20px] top-0 bottom-0 w-0.5 bg-border md:hidden" />
            <div className="space-y-12">
              {steps.map((step, index) => {
                const Icon = iconMap[step.icon] || ClipboardList;
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex items-center gap-8 md:gap-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    {}
                    <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full bg-background border-4 border-primary flex items-center justify-center z-10 shadow-lg">
                      <span className="text-sm md:text-xl font-bold text-primary">{index + 1}</span>
                    </div>
                    {}
                    <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
                      <div className="glass-card p-6 hover:border-primary/50 transition-colors group">
                        <div className={`flex items-center gap-4 mb-3 ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg md:text-xl font-bold">{step.title}</h3>
                        </div>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {}
                    <div className="hidden md:block md:w-1/2" />
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div className="mt-16 text-center">
            <Link 
              to="/pendaftaran" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-primary text-primary-foreground font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Daftar Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}