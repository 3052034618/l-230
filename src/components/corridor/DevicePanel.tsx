import { useEffect, useState } from 'react';
import { getCorridorDevices } from '@/services/corridor.service';
import type { Device } from '@/types';
import { Lightbulb, Wind, Droplets, DoorOpen, Camera, Wrench } from 'lucide-react';
import { DEVICE_TYPE_LABELS } from '@/utils/constants';
import { cn, formatDateTime } from '@/utils/format';
import { Loader2 } from 'lucide-react';

const deviceIcons: Record<string, typeof Lightbulb> = {
  lighting: Lightbulb,
  fan: Wind,
  pump: Droplets,
  door: DoorOpen,
  camera: Camera,
};

export default function DevicePanel({ corridorId }: { corridorId: string }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCorridorDevices(corridorId)
      .then((res) => mounted && setDevices(res))
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

  const grouped = devices.reduce<Record<string, Device[]>>((acc, d) => {
    if (!acc[d.type]) acc[d.type] = [];
    acc[d.type].push(d);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([type, list]) => {
        const Icon = deviceIcons[type] || Lightbulb;
        const online = list.filter((d) => d.status === 'online').length;
        const total = list.length;
        const availability = (online / total) * 100;
        const faultDevice = list.find((d) => d.status === 'fault');
        return (
          <div
            key={type}
            className="rounded-xl border border-slate-700/60 bg-surface-900/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
                  <Icon size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {DEVICE_TYPE_LABELS[type]}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    在线 {online}/{total} · 可用率 {availability.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-700">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    availability >= 90
                      ? 'bg-emerald-500'
                      : availability >= 75
                      ? 'bg-brand-500'
                      : 'bg-red-500'
                  )}
                  style={{ width: `${availability}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
              {list.map((device) => (
                <div
                  key={device.id}
                  className={cn(
                    'group relative flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all hover:bg-surface-800',
                    device.status === 'online'
                      ? 'border-emerald-500/20 hover:border-emerald-500/40'
                      : device.status === 'fault'
                      ? 'border-red-500/30 bg-red-500/5 hover:border-red-500/50'
                      : 'border-slate-700/40'
                  )}
                >
                  <div
                    className={cn(
                      'absolute right-1 top-1 h-1.5 w-1.5 rounded-full',
                      device.status === 'online'
                        ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                        : device.status === 'fault'
                        ? 'bg-red-400 animate-pulse shadow-[0_0_6px_#f87171]'
                        : 'bg-slate-500'
                    )}
                  />
                  <div
                    className={cn(
                      'text-base',
                      device.status === 'online'
                        ? 'text-emerald-400'
                        : device.status === 'fault'
                        ? 'text-red-400'
                        : 'text-slate-500'
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="mt-1 truncate text-[10px] text-slate-400">
                    {device.name.split('-').pop()}
                  </div>
                </div>
              ))}
            </div>
            {list.some((d) => d.status === 'fault') && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
                <Wrench size={14} className="text-red-400" />
                <span className="text-xs text-red-400">
                  {list.filter((d) => d.status === 'fault').length}台设备故障，需维修
                </span>
                <span className="ml-auto text-[10px] text-slate-500">
                  最近维护: {formatDateTime(faultDevice?.lastMaintenance || '')}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
