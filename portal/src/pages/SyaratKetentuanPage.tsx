import SEOHead from '@/components/SEOHead';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper from '@/components/shared/SectionWrapper';

const SyaratKetentuanPage = () => {
  return (
    <>
      <SEOHead
        title="Syarat & Ketentuan"
        description="Syarat dan ketentuan penggunaan website Pondok Pesantren Modern Raudhatussalam Mahato."
        path="/syarat-ketentuan"
      />

      <PageHeader
        title="Syarat & Ketentuan"
        subtitle="Ketentuan penggunaan layanan website secara umum."
        breadcrumbs={[{ label: 'Syarat & Ketentuan' }]}
      />

      <SectionWrapper>
        <div className="max-w-4xl mx-auto space-y-8">
          <section className="space-y-2">
            <h2 className="text-xl font-bold">1. Penerimaan Ketentuan</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dengan mengakses website ini, pengguna dianggap telah memahami dan menyetujui syarat dan ketentuan yang berlaku.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">2. Penggunaan Layanan</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pengguna wajib menggunakan layanan website secara sah, bertanggung jawab, dan tidak melanggar ketentuan hukum yang berlaku.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">3. Akurasi Informasi</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pengguna bertanggung jawab memastikan data yang dikirimkan melalui formulir pendaftaran atau layanan lain adalah benar dan dapat dipertanggungjawabkan.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">4. Hak Kekayaan Intelektual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Konten pada website ini, termasuk teks, gambar, dan identitas visual, dilindungi hak cipta dan tidak boleh digunakan tanpa izin.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">5. Batasan Tanggung Jawab</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pengelola berupaya menjaga keandalan layanan, namun tidak bertanggung jawab atas gangguan teknis di luar kendali yang menyebabkan layanan tidak dapat diakses sementara.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">6. Perubahan Ketentuan</h2>
            <p className="text-muted-foreground leading-relaxed">
              Syarat dan ketentuan dapat diperbarui sewaktu-waktu. Pengguna disarankan meninjau halaman ini secara berkala.
            </p>
          </section>
        </div>
      </SectionWrapper>
    </>
  );
};

export default SyaratKetentuanPage;
