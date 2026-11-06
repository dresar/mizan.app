import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, X, Calendar, Briefcase, GraduationCap, MapPin, Mail, Phone } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper, { SectionHeader } from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
interface WebsiteSettings {
  profilSingkat?: string;
  profilLengkap?: string;
  gambarProfil?: string;
}
interface Founder {
  id: number;
  namaLengkap: string;
  tanggalLahir: string;
  jabatan: 'Pendiri' | 'Pengasuh' | 'Penasehat';
  foto: string;
  pendidikanTerakhir: string;
  profilSingkat: string;
  noTelepon: string;
  alamat: string;
  email?: string;
}
const ProfilKami = () => {
  const { data: settings, isLoading: isLoadingSettings } = usePublicData<WebsiteSettings>(['settings'], '/core/settings');
  const { data: founders, isLoading: isLoadingFounders } = usePublicData<Founder[]>(['founders'], '/core/website/founders');
  const [selectedFounder, setSelectedFounder] = useState<Founder | null>(null);
  const isLoading = isLoadingSettings || isLoadingFounders;
  if (isLoading) {
    return (
      <>
        <PageHeader title="Profil Kami" subtitle="Mengenal lebih dekat pondok pesantren kami." breadcrumbs={[{ label: 'Profil' }]} />
        <SectionWrapper>
          <div className="max-w-3xl mx-auto space-y-8">
             <div className="h-32 bg-muted animate-pulse rounded-xl" />
             <div className="h-64 bg-muted animate-pulse rounded-xl" />
          </div>
        </SectionWrapper>
      </>
    );
  }
  return (
    <>
      <PageHeader
        title="Profil Kami"
        subtitle="Mengenal lebih dekat visi, misi, dan tokoh-tokoh di balik pesantren."
        breadcrumbs={[{ label: 'Profil' }]}
      />
      {}
      <SectionWrapper>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="aspect-video rounded-2xl overflow-hidden shadow-xl border border-border">
              <img 
                src={settings?.gambarProfil || '/placeholder-image.jpg'} 
                alt="Profil Pesantren" 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000'; }}
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SectionHeader title="Profil Singkat" className="mb-6 text-left" />
            <div 
              className="prose prose-lg text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: settings?.profilSingkat || "Profil singkat belum tersedia." }}
            />
          </motion.div>
        </div>
      </SectionWrapper>
      {}
      {settings?.profilLengkap && (
        <SectionWrapper className="bg-secondary/30">
          <SectionHeader title="Profil Lengkap" subtitle="Informasi detail mengenai pesantren kami." />
          <div className="max-w-4xl mx-auto bg-background rounded-2xl p-8 shadow-sm border border-border">
            <div 
              className="prose prose-lg max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: settings.profilLengkap }}
            />
          </div>
        </SectionWrapper>
      )}
      {}
      <SectionWrapper>
        <SectionHeader badge="Tokoh" title="Para Pendiri & Pengasuh" subtitle="Tokoh-tokoh yang berjasa dalam merintis dan mengembangkan pesantren." />
        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
           {Array.isArray(founders) && founders.map((founder, i) => (
             <motion.div 
               key={founder.id}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="group relative bg-background border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
             >
               <div className="aspect-[3/4] overflow-hidden bg-muted relative">
                 <img 
                   src={founder.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.namaLengkap)}&background=random`} 
                   alt={founder.namaLengkap} 
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                   onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.namaLengkap)}&background=random`; }}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                   <Button 
                     size="sm" 
                     className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20 text-white"
                     onClick={() => setSelectedFounder(founder)}
                   >
                     Lihat Detail
                   </Button>
                 </div>
               </div>
               <div className="p-4 text-center">
                 <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-1" title={founder.namaLengkap}>{founder.namaLengkap}</h3>
                 <p className="text-sm text-primary font-medium">{founder.jabatan}</p>
               </div>
             </motion.div>
           ))}
           {(!Array.isArray(founders) || founders.length === 0) && (
             <div className="col-span-full text-center py-12 text-muted-foreground">
               Belum ada data pendiri.
             </div>
           )}
        </div>
      </SectionWrapper>
      {}
      <Dialog open={!!selectedFounder} onOpenChange={(open) => !open && setSelectedFounder(null)}>
        <DialogContent className="sm:max-w-3xl overflow-hidden p-0 gap-0">
          {selectedFounder && (
            <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto md:overflow-hidden">
              {}
              <div className="w-full md:w-1/3 bg-muted aspect-[3/4] md:aspect-auto relative">
                <img 
                  src={selectedFounder.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedFounder.namaLengkap)}`}
                  alt={selectedFounder.namaLengkap}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden flex items-end p-6">
                  <div className="text-white">
                    <h2 className="text-2xl font-bold">{selectedFounder.namaLengkap}</h2>
                    <p className="text-white/80">{selectedFounder.jabatan}</p>
                  </div>
                </div>
              </div>
              {}
              <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">
                <div className="hidden md:block border-b border-border pb-4">
                  <h2 className="text-2xl font-bold">{selectedFounder.namaLengkap}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{selectedFounder.jabatan}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block">Tanggal Lahir</span>
                      <span>{format(new Date(selectedFounder.tanggalLahir), 'd MMMM yyyy', { locale: idLocale })}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block">Pendidikan Terakhir</span>
                      <span>{selectedFounder.pendidikanTerakhir}</span>
                    </div>
                  </div>
                  {selectedFounder.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-muted-foreground block">Email</span>
                        <a href={`mailto:${selectedFounder.email}`} className="hover:underline text-primary">{selectedFounder.email}</a>
                      </div>
                    </div>
                  )}
                  {selectedFounder.noTelepon && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-muted-foreground block">Kontak</span>
                        <span>{selectedFounder.noTelepon}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block">Alamat</span>
                      <span>{selectedFounder.alamat}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block">Profil Singkat</span>
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedFounder.profilSingkat}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-6 border-t border-border flex justify-end">
                   <Button variant="outline" onClick={() => setSelectedFounder(null)}>Tutup</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
export default ProfilKami;