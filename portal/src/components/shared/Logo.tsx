import { usePublicData } from '@/hooks/use-public-data';
interface LogoProps {
  className?: string;
  variant?: 'icon' | 'full';
  iconClassName?: string;
}
interface WebsiteSettings {
  logo?: string;
  logoUrl?: string; 
}
export const Logo = ({ className = '', variant = 'icon', iconClassName = 'w-10 h-10' }: LogoProps) => {
  const { data: settings, isLoading } = usePublicData<WebsiteSettings>(['settings'], '/core/settings');
  const defaultLogo = '/logo.svg';
  const logoUrl = settings?.logo || settings?.logoUrl || defaultLogo;
  if (variant === 'full') {
    return (
      <img 
        src={logoUrl} 
        alt="Logo Pesantren" 
        className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={(e) => {
          e.currentTarget.src = defaultLogo;
          e.currentTarget.onerror = null; 
        }}
      />
    );
  }
  return (
    <div className={`${iconClassName} rounded-xl overflow-hidden flex items-center justify-center bg-white/5 shadow-sm ${className}`}>
      <img 
        src={logoUrl} 
        alt="Logo" 
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={(e) => {
          e.currentTarget.src = defaultLogo;
          e.currentTarget.onerror = null; 
        }}
      />
    </div>
  );
};