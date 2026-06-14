import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCorridor } from '@/services/corridor.service';
import type { CorridorSection } from '@/types';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Ruler,
  Calendar,
  Activity,
  AlertTriangle,
  Thermometer,
  Wrench,
  Clock,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { cn, formatNumber, formatDate } from '@/utils/format';
import { CORRIDOR_STATUS_LABELS } from '@/utils/constants';
import SensorGrid from '@/components/corridor/SensorGrid';
import DevicePanel from '@/components/corridor/DevicePanel';
import MaintenanceTimeline from '@/components/corridor/MaintenanceTimeline';
import { Loader2 } from 'lucide-react';

export default function CorridorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [corridor, setCorridor] = useState<CorridorSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'sensors' | 'devices' | 'events'>('sensors');

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    getCorridor(id)
      .then((res) => mounted && setCorridor(res))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading || !corridor) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    );
  }

  const tabs = [
    { key: 'sensors', label: '传感器监测', icon: Thermometer },
    { key: 'devices', label: '设备状态', icon: Activity },
    { key: 'events', label: '维修时间线', icon: Wrench },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
            返回
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-white">{corridor.name}</h1>
              <Badge
                variant={
                  corridor.status === 'online'
                    ? 'success'
                    : corridor.status === 'maintenance'
                    ? 'warning'
                    : 'danger'
                }
              >
                {CORRIDOR_STATUS_LABELS[corridor.status]}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {corridor.province} {corridor.city}
              </span>
              <span className="flex items-center gap-1">
                <Ruler size={12} />
                {corridor.length}公里
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                建成于 {corridor.constructionYear}年
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            查看报告
          </Button>
          <Button size="sm">发起报修</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div
          className={cn(
            'rounded-xl border p-5',
            corridor.healthIndex >= 85
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : corridor.healthIndex >= 70
              ? 'border-brand-500/40 bg-brand-500/10'
              : corridor.healthIndex >= 55
              ? 'border-amber-500/40 bg-amber-500/10'
              : 'border-red-500/40 bg-red-500/10'
          )}
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} />
            健康指数
          </div>
          <div
            className={cn(
              'mt-2 font-display text-4xl font-bold',
              corridor.healthIndex >= 85
                ? 'text-emerald-400 text-glow-green'
                : corridor.healthIndex >= 70
                ? 'text-brand-400 text-glow-cyan'
                : corridor.healthIndex >= 55
                ? 'text-amber-400'
                : 'text-red-400 text-glow-red'
            )}
          >
            {formatNumber(corridor.healthIndex, 1)}
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-900/60">
            <div
              className={cn(
                'h-full rounded-full',
                corridor.healthIndex >= 85
                  ? 'bg-emerald-500'
                  : corridor.healthIndex >= 70
                  ? 'bg-brand-500'
                  : corridor.healthIndex >= 55
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              )}
              style={{ width: `${corridor.healthIndex}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/60 bg-surface-800/60 p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Activity size={14} />
            设备可用率
          </div>
          <div className="mt-2 font-display text-4xl font-bold text-emerald-400">
            {formatNumber(corridor.deviceAvailability, 1)}
            <span className="ml-1 text-base font-normal text-slate-500">%</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            {corridor.deviceAvailability >= 90 ? '运行状态良好' : '存在设备故障，需关注'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/60 bg-surface-800/60 p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <AlertTriangle size={14} />
            故障率
          </div>
          <div
            className={cn(
              'mt-2 font-display text-4xl font-bold',
              corridor.failureRate < 2
                ? 'text-emerald-400'
                : corridor.failureRate < 4
                ? 'text-amber-400'
                : 'text-red-400'
            )}
          >
            {formatNumber(corridor.failureRate, 2)}
            <span className="ml-1 text-base font-normal text-slate-500">%</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">近30天统计</div>
        </div>

        <div className="rounded-xl border border-slate-700/60 bg-surface-800/60 p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock size={14} />
            上次巡检
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-white">
            {formatDate(new Date(Date.now() - Math.random() * 60 * 86400000).toISOString())}
          </div>
          <div className="mt-3 text-xs text-slate-500">距下次巡检还有 {Math.floor(Math.random() * 30 + 5)}天</div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1 border-b border-slate-700/60">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all',
                  tab === t.key
                    ? 'text-brand-400'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Icon size={15} />
                {t.label}
                {tab === t.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-5">
          {tab === 'sensors' && id && <SensorGrid corridorId={id} />}
          {tab === 'devices' && id && <DevicePanel corridorId={id} />}
          {tab === 'events' && id && <MaintenanceTimeline corridorId={id} />}
        </div>
      </div>
    </div>
  );
}
