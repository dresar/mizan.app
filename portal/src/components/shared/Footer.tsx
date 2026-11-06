import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react';
import { navItems } from '@/lib/constants';
import { usePublicData } from '@/hooks/use-public-data';
import { Logo } from '@/components/shared/Logo';
interface WebsiteSettings {
  alamat?: string;
  noTelepon?: string;
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  logoUrl?: string;
  namaInstansi?: string;
  tagline?: string;
}
const Footer = () => {
  const { data: settings } = usePublicData<WebsiteSettings>(['settings'], '/core/settings');
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Info */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <Logo variant="icon" iconClassName="w-9 h-9" />
              <div>
                <span className="text-sm font-bold tracking-tight leading-none block">{settings?.namaInstansi || 'Raudhatussalam'}</span>
                <span className="text-[10px] text-muted-foreground leading-none">{settings?.tagline || 'Pesantren Modern'}</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Mencetak generasi pemimpin umat yang berilmu amaliyah, beramal ilmiyah, dan berakhlakul karimah.
            </p>
            <div className="flex items-center gap-3">
              <a href={settings?.instagramUrl || "#"} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={settings?.facebookUrl || "#"} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={settings?.youtubeUrl || "#"} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
          {}
          <div>
            <h4 className="text-sm font-semibold mb-4">Menu</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Beranda', href: '/' },
                { label: 'Profil', href: '/sejarah' },
                { label: 'Program', href: '/program' },
                { label: 'Fasilitas', href: '/fasilitas' },
                { label: 'Kehidupan Santri', href: '/kehidupan-santri/jadwal' },
                { label: 'Publikasi', href: '/publikasi' },
              ].map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {}
          <div>
            <h4 className="text-sm font-semibold mb-4">Program</h4>
            <ul className="space-y-2.5">
              {['SDIT', 'MDTA', 'MTs', 'MA', 'KMI'].map((p) => (
                <li key={p}>
                  <Link to="/program" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h4 className="text-sm font-semibold mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                <span>{settings?.alamat || 'Loading...'}</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                <span>{settings?.noTelepon || 'Loading...'}</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                <span>{settings?.email || 'Loading...'}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2025 Pondok Pesantren Modern Raudhatussalam. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/kebijakan-privasi" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
            <Link to="/syarat-ketentuan" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;