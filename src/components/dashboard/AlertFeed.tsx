import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useAlertStore } from '@/store/useAlertStore';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime, cn, getRelativeTime } from '@/utils/format';
import { ALERT_STATUS_LABELS, ALERT_TYPE_LABELS } from '@/utils/constants';
import Badge from '@/components/ui/Badge';

export default function AlertFeed() {
  const { alerts, fetchAlerts } = useAlertStore();

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const activeAlerts = alerts
    .filter((a) => a.status !== 'closed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin pr-1">
        {activeAlerts.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center text-slate-500">
            <AlertTriangle size={32} className="mb-2 opacity-40" />
            <div className="text-sm">暂无待处理预警</div>
          </div>
        )}
        {activeAlerts.map((alert) => (
          <Link
            key={alert.id}
            to={`/alerts/${alert.id}`}
            className={cn(
              'group flex items-start gap-3 rounded-lg border p-3 transition-all hover:border-brand-500/40 hover:bg-surface-700/40',
              alert.level === 2 ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/20 bg-amber-500/5'
            )}
          >
            <div
              className={cn(
                'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                alert.level === 2 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
              )}
            >
              <AlertTriangle size={16} className={alert.status === 'pending' ? 'animate-blink' : ''} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn('font-display text-sm font-semibold', alert.level === 2 ? 'text-red-400' : 'text-amber-400')}>
                  L{alert.level} {alert.title}
                </span>
                <Badge variant={alert.status === 'pending' ? 'danger' : alert.status === 'processing' ? 'warning' : 'cyan'}>
                  {ALERT_STATUS_LABELS[alert.status]}
                </Badge>
              </div>
              <div className="mt-0.5 truncate text-xs text-slate-400">{alert.corridorName}</div>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                <span>{ALERT_TYPE_LABELS[alert.type]}</span>
                <span>·</span>
                <span>{getRelativeTime(alert.createdAt)}</span>
                <span>·</span>
                <span>截止 {formatDateTime(alert.deadline).split(' ')[1]}</span>
              </div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-brand-400" />
          </Link>
        ))}
      </div>
      <Link
        to="/alerts"
        className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-slate-700 py-2 text-xs font-medium text-slate-400 transition hover:border-brand-500/40 hover:text-brand-400"
      >
        查看全部预警
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}
