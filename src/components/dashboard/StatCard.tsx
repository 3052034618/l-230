import type { LucideIcon } from 'lucide-react';
import { cn, formatPercent, formatNumber } from '@/utils/format';
import type { ReactNode } from 'react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  suffix?: string;
  change?: number;
  changeLabel?: string;
  color?: 'cyan' | 'emerald' | 'amber' | 'red' | 'blue';
  pulse?: boolean;
  children?: ReactNode;
}

const colorMap = {
  cyan: 'from-brand-500/20 to-brand-500/5 text-brand-400 border-brand-500/30',
  emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30',
  amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30',
  red: 'from-red-500/20 to-red-500/5 text-red-400 border-red-500/30',
  blue: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30',
};

const textColorMap = {
  cyan: 'text-brand-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
  blue: 'text-blue-400',
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  suffix,
  change,
  changeLabel,
  color = 'cyan',
  pulse = false,
  children,
}: StatCardProps) {
  const displayValue = typeof value === 'number' ? formatNumber(value, value < 10 ? 1 : 0) : value;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 transition-all duration-300 hover:-translate-y-0.5',
        colorMap[color]
      )}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-current opacity-5 blur-2xl transition group-hover:opacity-10" />

      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-slate-400">{label}</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span
              className={cn(
                'font-display font-bold tracking-tight',
                textColorMap[color],
                pulse && 'animate-pulse-slow'
              )}
              style={{ fontSize: '2rem', lineHeight: 1.1 }}
            >
              {displayValue}
              {unit && <span className="text-base opacity-70">{unit}</span>}
            </span>
            {suffix && <span className="text-sm text-slate-400">{suffix}</span>}
          </div>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span
                className={cn(
                  'font-medium',
                  change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-slate-400'
                )}
              >
                {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {formatPercent(Math.abs(change), 1)}
              </span>
              <span className="text-slate-500">{changeLabel || '较上周'}</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-surface-900/60',
            colorMap[color]
          )}
        >
          <Icon size={22} />
        </div>
      </div>
      {children}
    </div>
  );
}
