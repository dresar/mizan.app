import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, Loader2, HelpCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
import { api } from '@/lib/api';
import { WebsiteSettings, FaqItem } from '@/types';
import SEOHead, { SITE_URL } from '@/components/SEOHead';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
interface ContactForm {
  nama: string;
  email: string;
  subjek: string;
  pesan: string;
}
const KontakPage = () => {
  const { data: settings, isLoading } = usePublicData<WebsiteSettings>(['settings'], '/core/settings');
  const { data: faqs, isLoading: faqLoading } = usePublicData<FaqItem[]>(['faq'], '/core/faq');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>();
  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    try {
      await api.post('/core/contact', data);
      toast.success('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.');
      reset();
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <SEOHead
        title="Hubungi Kami"
        description="Hubungi Pondok Pesantren Modern Raudhatussalam Mahato. Kami siap menjawab pertanyaan seputar pendaftaran, program pendidikan, fasilitas, dan informasi umum pesantren."
        path="/kontak"
        keywords="kontak pesantren raudhatussalam, alamat pesantren mahato, nomor telepon pesantren rokan hulu, email pesantren riau"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Pondok Pesantren Modern Raudhatussalam Mahato',
          url: SITE_URL,
          telephone: settings?.noTelepon,
          email: settings?.email,
          address: {
            '@type': 'PostalAddress',
            streetAddress: settings?.alamat || 'Desa Mahato, Kec. Tambusai Utara',
            addressLocality: 'Rokan Hulu',
            addressRegion: 'Riau',
            addressCountry: 'ID',
          },
        }}
      />
      <PageHeader title="Hubungi Kami" subtitle="Kami siap menjawab pertanyaan Anda seputar pesantren." breadcrumbs={[{ label: 'Kontak' }]} />
      <SectionWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Informasi Kontak</h3>
            <div className="space-y-4">
              {[
                { icon: MapPin, label: 'Alamat', value: settings?.alamat || 'Jl. Contoh No. 123' },
                { icon: Phone, label: 'Telepon', value: settings?.noTelepon || '08123456789' },
                { icon: Mail, label: 'Email', value: settings?.email || 'admin@pesantren.com' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-start gap-4 glass-card p-4">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{isLoading ? 'Loading...' : item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {}
            <div className="aspect-video rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground text-sm overflow-hidden relative">
               {settings?.googleMapsEmbedCode ? (
                 <iframe 
                   src={settings.googleMapsEmbedCode} 
                   width="100%" 
                   height="100%" 
                   style={{ border: 0 }} 
                   allowFullScreen 
                   loading="lazy" 
                   referrerPolicy="no-referrer-when-downgrade"
                 />
               ) : (
                 <span>Google Maps akan ditampilkan di sini</span>
               )}
            </div>
          </div>
          {}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-6 md:p-8">
            <h3 className="text-xl font-semibold mb-6">Kirim Pesan</h3>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nama Lengkap</label>
                <input 
                  {...register('nama', { required: 'Nama wajib diisi' })}
                  type="text" 
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                  placeholder="Masukkan nama Anda" 
                />
                {errors.nama && <span className="text-xs text-destructive mt-1">{errors.nama.message}</span>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input 
                  {...register('email', { required: 'Email wajib diisi', pattern: { value: /^\S+@\S+$/i, message: 'Email tidak valid' } })}
                  type="email" 
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                  placeholder="email@contoh.com" 
                />
                 {errors.email && <span className="text-xs text-destructive mt-1">{errors.email.message}</span>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Subjek</label>
                <input 
                  {...register('subjek', { required: 'Subjek wajib diisi' })}
                  type="text" 
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                  placeholder="Topik pesan Anda" 
                />
                {errors.subjek && <span className="text-xs text-destructive mt-1">{errors.subjek.message}</span>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Pesan</label>
                <textarea 
                  {...register('pesan', { required: 'Pesan wajib diisi' })}
                  rows={4} 
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" 
                  placeholder="Tulis pesan Anda..." 
                />
                {errors.pesan && <span className="text-xs text-destructive mt-1">{errors.pesan.message}</span>}
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg gradient-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
                {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
              </button>
            </form>
          </motion.div>
        </div>
      </SectionWrapper>
      {}
      <SectionWrapper className="bg-secondary/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <HelpCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Pertanyaan Umum (FAQ)</h2>
            <p className="text-muted-foreground">Jawaban untuk pertanyaan yang sering diajukan calon santri dan wali.</p>
          </div>
          {faqLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs?.filter(f => f.isPublished).map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AccordionItem value={`item-${faq.id}`} className="glass-card px-4 border-none rounded-lg">
                    <AccordionTrigger className="hover:no-underline py-4 font-medium text-left">
                      {faq.pertanyaan}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.jawaban}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
              {(!faqs || faqs.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada data FAQ yang tersedia.
                </div>
              )}
            </Accordion>
          )}
        </div>
      </SectionWrapper>
    </>
  );
};
export default KontakPage;