import Chart from '@/components/ui/Chart';
import { useCorridorStore } from '@/store/useCorridorStore';
import { useEffect, useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { useNavigate } from 'react-router-dom';
import { registerChinaMap } from '@/utils/chinaMap';

export default function HealthHeatmap() {
  const { heatmapData, fetchHeatmap } = useCorridorStore();
  const navigate = useNavigate();

  useEffect(() => {
    registerChinaMap();
    fetchHeatmap();
  }, [fetchHeatmap]);

  const option = useMemo(
    () => ({
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#F8FAFC', fontSize: 12 },
        formatter: (params: unknown) => {
          const p = params as { data: { name: string; value: number[]; city: string; healthIndex: number } };
          if (!p.data) return '';
          const health = p.data.healthIndex;
          const statusColor = health >= 85 ? '#10B981' : health >= 70 ? '#06B6D4' : health >= 55 ? '#F59E0B' : '#EF4444';
          return `<div style="font-size:12px">
            <div style="font-weight:600;margin-bottom:6px">${p.data.name}</div>
            <div style="color:#94A3B8">${p.data.city}</div>
            <div style="margin-top:6px;color:${statusColor};font-weight:600;font-size:16px;font-family:'JetBrains Mono',monospace">
              健康指数 ${health.toFixed(1)}
            </div>
          </div>`;
        },
      },
      geo: {
        map: 'china',
        roam: false,
        zoom: 1.2,
        silent: false,
        itemStyle: {
          areaColor: '#0F172A',
          borderColor: '#1E3A5F',
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            areaColor: '#1E293B',
            borderColor: '#06B6D4',
          },
          label: { show: false },
        },
      },
      visualMap: {
        show: true,
        min: 40,
        max: 100,
        left: 20,
        bottom: 30,
        text: ['优', '差'],
        textStyle: { color: '#94A3B8', fontSize: 10 },
        inRange: {
          color: ['#EF4444', '#F59E0B', '#06B6D4', '#10B981'],
        },
        itemWidth: 12,
        itemHeight: 80,
        calculable: true,
      },
      series: [
        {
          name: '健康指数',
          type: 'scatter',
          coordinateSystem: 'geo',
          symbolSize: (val: number[]) => {
            const health = val[2];
            return 8 + (health - 40) * 0.4;
          },
          data: heatmapData.map((item) => ({
            name: item.name,
            value: [...item.coordinates, item.healthIndex],
            city: item.city,
            healthIndex: item.healthIndex,
            id: item.id,
          })),
          itemStyle: {
            color: (params: unknown) => {
              const p = params as { data: { value: number[] } };
              const health = p.data.value[2];
              if (health >= 85) return '#10B981';
              if (health >= 70) return '#06B6D4';
              if (health >= 55) return '#F59E0B';
              return '#EF4444';
            },
            shadowBlur: 15,
            shadowColor: (params: unknown) => {
              const p = params as { data: { value: number[] } };
              const health = p.data.value[2];
              if (health >= 85) return 'rgba(16, 185, 129, 0.7)';
              if (health >= 70) return 'rgba(6, 182, 212, 0.7)';
              if (health >= 55) return 'rgba(245, 158, 11, 0.7)';
              return 'rgba(239, 68, 68, 0.7)';
            },
            opacity: 0.9,
          },
          emphasis: {
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 25,
            },
          },
        },
        {
          name: '涟漪效果',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          symbolSize: 6,
          data: heatmapData
            .filter((item) => item.healthIndex < 70)
            .map((item) => ({
              name: item.name,
              value: [...item.coordinates, item.healthIndex],
            })),
          rippleEffect: {
            brushType: 'stroke',
            scale: 4,
            period: 4,
          },
          itemStyle: {
            color: (params: unknown) => {
              const p = params as { data: { value: number[] } };
              const health = p.data.value[2];
              return health < 55 ? '#EF4444' : '#F59E0B';
            },
          },
        },
      ],
    }),
    [heatmapData]
  );

  const onEvents = {
    click: (params: unknown) => {
      const p = params as { data?: { id?: string } };
      if (p.data?.id) {
        navigate(`/corridor/${p.data.id}`);
      }
    },
  };

  return (
    <div className="relative">
      <Chart option={option} height={420} onEvents={onEvents} />
      <div className="absolute right-4 top-4 flex gap-2">
        <div className="flex items-center gap-1.5 rounded-md bg-surface-900/80 px-2 py-1 text-[10px] text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> 优秀 ≥85
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-surface-900/80 px-2 py-1 text-[10px] text-slate-400">
          <span className="h-2 w-2 rounded-full bg-brand-500" /> 良好 ≥70
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-surface-900/80 px-2 py-1 text-[10px] text-slate-400">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> 一般 ≥55
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-surface-900/80 px-2 py-1 text-[10px] text-slate-400">
          <span className="h-2 w-2 rounded-full bg-red-500" /> 较差
        </div>
      </div>
    </div>
  );
}
