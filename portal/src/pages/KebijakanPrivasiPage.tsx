import SEOHead from '@/components/SEOHead';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper from '@/components/shared/SectionWrapper';

const KebijakanPrivasiPage = () => {
  return (
    <>
      <SEOHead
        title="Kebijakan Privasi"
        description="Kebijakan Privasi Pondok Pesantren Modern Raudhatussalam Mahato."
        path="/kebijakan-privasi"
      />

      <PageHeader
        title="Kebijakan Privasi"
        subtitle="Komitmen kami dalam melindungi data dan privasi pengguna website."
        breadcrumbs={[{ label: 'Kebijakan Privasi' }]}
      />

      <SectionWrapper>
        <div className="max-w-4xl mx-auto space-y-8">
          <section className="space-y-2">
            <h2 className="text-xl font-bold">1. Informasi Yang Kami Kumpulkan</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kami dapat mengumpulkan informasi yang Anda berikan secara langsung, seperti nama, nomor telepon, email, dan data pendaftaran.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">2. Penggunaan Informasi</h2>
            <p className="text-muted-foreground leading-relaxed">
              Informasi digunakan untuk keperluan layanan pendidikan, administrasi pesantren, komunikasi kepada calon santri/wali santri, dan peningkatan kualitas layanan website.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">3. Perlindungan Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kami berupaya menjaga keamanan data melalui kontrol akses dan praktik keamanan teknis yang wajar untuk mencegah akses, perubahan, atau pengungkapan yang tidak sah.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">4. Pembagian Data Kepada Pihak Ketiga</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kami tidak menjual data pribadi Anda. Data hanya dapat dibagikan jika diperlukan untuk proses layanan atau diwajibkan oleh ketentuan hukum yang berlaku.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">5. Hak Pengguna</h2>
            <p className="text-muted-foreground leading-relaxed">
              Anda berhak meminta koreksi atau pembaruan data yang tidak akurat sesuai mekanisme layanan yang disediakan oleh pengelola.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold">6. Perubahan Kebijakan</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kebijakan ini dapat diperbarui dari waktu ke waktu. Versi terbaru akan ditampilkan di halaman ini.
            </p>
          </section>
        </div>
      </SectionWrapper>
    </>
  );
};

export default KebijakanPrivasiPage;
