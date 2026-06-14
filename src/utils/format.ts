import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

export function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDate(dateStr);
}

export function getHealthStatusColor(index: number): string {
  if (index >= 85) return 'text-emerald-400';
  if (index >= 70) return 'text-cyan-400';
  if (index >= 55) return 'text-amber-400';
  return 'text-red-400';
}

export function getHealthBgColor(index: number): string {
  if (index >= 85) return 'bg-emerald-500/20 border-emerald-500/40';
  if (index >= 70) return 'bg-cyan-500/20 border-cyan-500/40';
  if (index >= 55) return 'bg-amber-500/20 border-amber-500/40';
  return 'bg-red-500/20 border-red-500/40';
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'high':
      return 'text-red-400 bg-red-500/20 border-red-500/40';
    case 'medium':
      return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
    case 'low':
      return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    default:
      return 'text-slate-400 bg-slate-500/20 border-slate-500/40';
  }
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
