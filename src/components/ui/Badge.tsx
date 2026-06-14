import { cn } from '@/utils/format';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'cyan';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export default function Badge({ children, variant = 'default', size = 'sm', pulse = false, className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-700 text-slate-200 border-slate-600',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    danger: 'bg-red-500/15 text-red-400 border-red-500/40',
    info: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
    cyan: 'bg-brand-500/15 text-brand-400 border-brand-500/40',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border font-medium',
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {pulse && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
