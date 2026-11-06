import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
interface PublicThemeToggleProps {
  compact?: boolean;
  className?: string;
}
const PublicThemeToggle = ({ compact = false, className = '' }: PublicThemeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const cycle = () => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  return (
    <button
      onClick={(e) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        cycle();
      }}
      className={`p-2 rounded-full transition-colors ${className}`}
      aria-label="Ganti tema website"
      title={`Tema: ${theme}`}
      type="button"
    >
      <Icon className="w-5 h-5" />
      {!compact && <span className="sr-only">Tema: {theme}</span>}
    </button>
  );
};
export default PublicThemeToggle;