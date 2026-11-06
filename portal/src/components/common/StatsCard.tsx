import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'destructive';
  accent?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'bg-card border-border border-l-[3px] border-l-[#10b981]',
  accent: 'bg-card border-border border-l-[3px] border-l-[#10b981]',
  success: 'bg-card border-border border-l-[3px] border-l-emerald-600',
  warning: 'bg-card border-border border-l-[3px] border-l-amber-500',
  destructive: 'bg-card border-border border-l-[3px] border-l-rose-500',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-emerald-500/10 text-emerald-500',
  accent: 'bg-emerald-500/10 text-emerald-500',
  success: 'bg-emerald-500/10 text-emerald-500',
  warning: 'bg-amber-500/10 text-amber-500',
  destructive: 'bg-rose-500/10 text-rose-500',
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  accent = false,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'card relative overflow-hidden rounded-[4px] !rounded-[4px] border p-5 transition-all duration-200',
        variantStyles[variant],
        accent && 'card--accent border-l-[3px] border-l-[#10b981]',
        className
      )}
      style={{ borderRadius: '4px' }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
            {trend && (
              <span
                className={cn(
                  'flex items-center gap-0.5 text-xs font-medium',
                  trend.isPositive ? 'text-emerald-500' : 'text-rose-500'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px]',
            iconStyles[variant]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
