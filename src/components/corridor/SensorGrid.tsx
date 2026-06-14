import { useEffect, useState } from 'react';
import { getCorridorSensors } from '@/services/corridor.service';
import type { SensorData } from '@/types';
import { Thermometer, Droplets, Wind, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SENSOR_TYPE_LABELS } from '@/utils/constants';
import { cn, formatNumber } from '@/utils/format';
import SensorTrendChart from '@/components/charts/SensorTrendChart';
import { Loader2 } from 'lucide-react';

const sensorIcons: Record<string, typeof Thermometer> = {
  temperature: Thermometer,
  humidity: Droplets,
  gas_ch4: Wind,
  gas_co: Wind,
  gas_h2s: Wind,
  oxygen: Wind,
};

export default function SensorGrid({ corridorId }: { corridorId: string }) {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>('temperature');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCorridorSensors(corridorId)
      .then((res) => mounted && setSensors(res))
      .finally(() => (mounted && setLoading(false)));
    return () => {
      mounted = false;
    };
  }, [corridorId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {sensors.map((sensor) => {
          const Icon = sensorIcons[sensor.type] || Wind;
          const isSelected = selected === sensor.type;
          const statusColor =
            sensor.status === 'danger'
              ? 'border-red-500/40 bg-red-500/10'
              : sensor.status === 'warning'
              ? 'border-amber-500/40 bg-amber-500/10'
              : 'border-emerald-500/40 bg-emerald-500/10';
          return (
            <button
              key={sensor.id}
              onClick={() => setSelected(sensor.type)}
              className={cn(
                'rounded-xl border p-4 text-left transition-all',
                isSelected
                  ? 'border-brand-500/60 bg-brand-500/10 shadow-lg ring-1 ring-brand-500/30'
                  : statusColor,
                'hover:border-slate-600'
              )}
            >
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    sensor.status === 'danger'
                      ? 'bg-red-500/20 text-red-400'
                      : sensor.status === 'warning'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  )}
                >
                  <Icon size={18} />
                </div>
                {sensor.status === 'normal' ? (
                  <CheckCircle2 size={14} className="text-emerald-500/60" />
                ) : (
                  <AlertTriangle
                    size={14}
                    className={cn(
                      'animate-pulse',
                      sensor.status === 'danger' ? 'text-red-400' : 'text-amber-400'
                    )}
                  />
                )}
              </div>
              <div className="mt-3">
                <div className="text-xs text-slate-400">{SENSOR_TYPE_LABELS[sensor.type]}</div>
                <div
                  className={cn(
                    'mt-1 font-mono text-xl font-bold',
                    sensor.status === 'danger'
                      ? 'text-red-400 text-glow-red'
                      : sensor.status === 'warning'
                      ? 'text-amber-400'
                      : 'text-white'
                  )}
                >
                  {formatNumber(sensor.value, sensor.type === 'oxygen' ? 2 : 1)}
                  <span className="ml-1 text-xs font-normal text-slate-500">{sensor.unit}</span>
                </div>
                {sensor.status !== 'normal' && (
                  <div className="mt-1 text-[10px] text-slate-500">
                    阈值: {sensor.threshold.warning}
                    {sensor.unit}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-surface-900/50 p-4">
        <SensorTrendChart
          corridorId={corridorId}
          sensorType={selected}
          title={`${SENSOR_TYPE_LABELS[selected]} 近7天趋势`}
          height={240}
        />
      </div>
    </div>
  );
}
