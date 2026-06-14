import type { ReactNode } from 'react';
import { cn } from '@/utils/format';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  rightElement?: ReactNode;
  glow?: 'cyan' | 'red' | 'green' | 'none';
}

export default function Card({ children, className, title, subtitle, rightElement, glow = 'none' }: CardProps) {
  const glowStyles = {
    cyan: 'border-glow-cyan',
    red: 'border-glow-red',
    green: 'shadow-[0_0_0_1px_rgba(16,185,129,0.4),0_0_20px_rgba(16,185,129,0.1)]',
    none: '',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-700/80 bg-surface-800/60 backdrop-blur-sm overflow-hidden transition-all hover:border-slate-600',
        glowStyles[glow],
        className
      )}
    >
      {(title || rightElement) && (
        <div className="flex items-start justify-between border-b border-slate-700/60 px-5 py-4">
          <div>
            {title && <h3 className="font-display text-base font-semibold text-white">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
          </div>
          {rightElement}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
