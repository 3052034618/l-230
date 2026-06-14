import { useEffect, useState } from 'react';
import { getCorridorMaintenance } from '@/services/corridor.service';
import type { MaintenanceEvent } from '@/types';
import {
  Wrench,
  Search,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Users,
  Clock,
} from 'lucide-react';
import { MAINTENANCE_TYPE_LABELS } from '@/utils/constants';
import { cn, formatDateTime, formatTime } from '@/utils/format';
import { Loader2 } from 'lucide-react';

const eventIcons = {
  repair: { icon: Wrench, color: 'text-red-400 bg-red-500/20 border-red-500/30' },
  inspection: { icon: Search, color: 'text-brand-400 bg-brand-500/20 border-brand-500/30' },
  alert_response: {
    icon: AlertTriangle,
    color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  },
  preventive: {
    icon: ShieldCheck,
    color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  },
};

export default function MaintenanceTimeline({ corridorId }: { corridorId: string }) {
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCorridorMaintenance(corridorId)
      .then((res) => mounted && setEvents(res))
      .finally(() => (mounted && setLoading(false)));
    return () => {
      mounted = false;
    };
  }, [corridorId]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand-400" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center text-slate-500">
        <Search size={28} className="mb-2 opacity-50" />
        <div className="text-sm">暂无历史记录</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-brand-500/40 via-slate-700 to-transparent" />
      <div className="space-y-1">
        {events.map((event) => {
          const cfg = eventIcons[event.type];
          const Icon = cfg.icon;
          const isExpanded = expanded === event.id;
          return (
            <div key={event.id} className="relative pl-12">
              <div
                className={cn(
                  'absolute left-0 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-900',
                  cfg.color
                )}
              >
                <Icon size={14} />
              </div>
              <div
                className={cn(
                  'cursor-pointer rounded-lg border p-4 transition-all',
                  isExpanded
                    ? 'border-brand-500/40 bg-brand-500/10'
                    : 'border-slate-700/60 bg-surface-900/30 hover:border-slate-600'
                )}
                onClick={() => setExpanded(isExpanded ? null : event.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-center gap-2">
                    <span className="font-display text-sm font-semibold text-white">
                      {event.title}
                    </span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-medium',
                        event.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : event.status === 'in_progress'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-slate-500/15 text-slate-400'
                      )}
                    >
                      {event.status === 'completed'
                        ? '已完成'
                        : event.status === 'in_progress'
                        ? '进行中'
                        : '计划中'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {MAINTENANCE_TYPE_LABELS[event.type]}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-slate-500" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-500" />
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {formatDateTime(event.startTime)}
                  </span>
                  {event.endTime && <span>至 {formatTime(event.endTime)}</span>}
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {event.personnel.join('、')}
                  </span>
                </div>
                {isExpanded && (
                  <div className="mt-3 space-y-2 border-t border-slate-700/60 pt-3 text-sm">
                    <p className="text-slate-300">{event.description}</p>
                    {event.deviceName && (
                      <div className="text-xs text-slate-500">
                        关联设备: <span className="text-slate-300">{event.deviceName}</span>
                      </div>
                    )}
                    {event.result && (
                      <div className="rounded-md bg-surface-800/60 p-2 text-xs text-slate-400">
                        <span className="font-medium text-emerald-400">处理结果: </span>
                        {event.result}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
