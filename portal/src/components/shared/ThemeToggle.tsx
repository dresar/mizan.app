import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
const ThemeToggle = ({ compact = false }: { compact?: boolean }) => {
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
        e.stopPropagation(); 
        cycle();
      }}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
      aria-label="Ganti tema"
      title={`Tema: ${theme}`}
    >
      <Icon className="w-4 h-4" />
      {!compact && <span className="sr-only">Tema: {theme}</span>}
    </button>
  );
};
export default ThemeToggle;