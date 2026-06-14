import { useEffect, useState, useMemo } from 'react';
import Chart from '@/components/ui/Chart';
import { getSensorTrend } from '@/services/corridor.service';
import type { EChartsOption } from 'echarts';
import { SENSOR_TYPE_LABELS } from '@/utils/constants';
import { Loader2 } from 'lucide-react';

interface SensorTrendChartProps {
  corridorId: string;
  sensorType: string;
  title?: string;
  height?: number;
}

const sensorColors: Record<string, string> = {
  temperature: '#F59E0B',
  humidity: '#3B82F6',
  gas_ch4: '#EF4444',
  gas_co: '#F97316',
  gas_h2s: '#A855F7',
  oxygen: '#10B981',
};

export default function SensorTrendChart({ corridorId, sensorType, title, height = 220 }: SensorTrendChartProps) {
  const [data, setData] = useState<{ timestamp: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [thresholds, setThresholds] = useState({ warning: 0, danger: 0 });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getSensorTrend(corridorId, sensorType)
      .then((res) => {
        if (mounted) {
          setData(res);
          const typeMap: Record<string, { warning: number; danger: number }> = {
            temperature: { warning: 35, danger: 45 },
            humidity: { warning: 80, danger: 90 },
            gas_ch4: { warning: 25, danger: 50 },
            gas_co: { warning: 24, danger: 100 },
            gas_h2s: { warning: 10, danger: 20 },
            oxygen: { warning: 19.5, danger: 18 },
          };
          setThresholds(typeMap[sensorType] || { warning: 0, danger: 0 });
          setLoading(false);
        }
      })
      .catch(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [corridorId, sensorType]);

  const option: EChartsOption = useMemo(() => {
    const color = sensorColors[sensorType] || '#06B6D4';
    const isOxygen = sensorType === 'oxygen';

    return {
      title: title
        ? {
            text: title,
            left: 0,
            top: 0,
            textStyle: { color: '#F8FAFC', fontSize: 12, fontWeight: 600 },
          }
        : undefined,
      grid: { left: 45, right: 15, top: title ? 30 : 10, bottom: 25 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#F8FAFC', fontSize: 12 },
        formatter: (params: unknown) => {
          const p = (params as { axisValueLabel: string; value: number[] }[])[0];
          if (!p) return '';
          return `<div style="font-size:12px">
            <div style="color:#94A3B8;margin-bottom:4px">${new Date(p.axisValueLabel).toLocaleString('zh-CN', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}</div>
            <div style="color:${color};font-weight:600;font-family:'JetBrains Mono',monospace">
              ${SENSOR_TYPE_LABELS[sensorType]}: ${p.value[1]}
            </div>
          </div>`;
        },
      },
      xAxis: {
        type: 'time',
        axisLine: { lineStyle: { color: '#334155' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#64748B',
          fontSize: 10,
          formatter: (v: number) => {
            const d = new Date(v);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          },
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' },
        splitLine: { lineStyle: { color: 'rgba(100, 116, 139, 0.1)', type: 'dashed' } },
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
      ],
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'lttb',
          data: data.map((d) => [d.timestamp, d.value]),
          lineStyle: { color, width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: color + '40' },
                { offset: 1, color: color + '00' },
              ],
            },
          },
          markLine: !isOxygen
            ? {
                silent: true,
                symbol: 'none',
                lineStyle: { type: 'dashed' },
                data: [
                  { yAxis: thresholds.warning, lineStyle: { color: '#F59E0B' }, label: { formatter: '警戒值', color: '#F59E0B', fontSize: 10, position: 'end' } },
                  { yAxis: thresholds.danger, lineStyle: { color: '#EF4444' }, label: { formatter: '危险值', color: '#EF4444', fontSize: 10, position: 'end' } },
                ],
              }
            : {
                silent: true,
                symbol: 'none',
                lineStyle: { type: 'dashed' },
                data: [
                  { yAxis: thresholds.warning, lineStyle: { color: '#F59E0B' }, label: { formatter: '警戒值', color: '#F59E0B', fontSize: 10, position: 'end' } },
                ],
              },
        },
      ],
    };
  }, [data, sensorType, thresholds, title]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <Loader2 size={20} className="animate-spin text-brand-400" />
      </div>
    );
  }

  return <Chart option={option} height={height} />;
}
