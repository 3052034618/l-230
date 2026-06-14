import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/format';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-900 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-brand-500 text-white hover:bg-brand-400 focus:ring-brand-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]',
    secondary:
      'bg-surface-700 text-white hover:bg-surface-600 focus:ring-surface-500/50',
    danger:
      'bg-red-500 text-white hover:bg-red-400 focus:ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.25)]',
    ghost:
      'text-slate-300 hover:bg-surface-700 hover:text-white focus:ring-surface-500/50',
    outline:
      'border border-surface-600 text-slate-300 hover:border-brand-500 hover:text-brand-400 hover:bg-brand-500/5 focus:ring-brand-500/30',
  };

  const sizes = {
    sm: 'h-7 px-3 text-xs rounded',
    md: 'h-9 px-4 text-sm rounded-lg',
    lg: 'h-11 px-6 text-base rounded-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
