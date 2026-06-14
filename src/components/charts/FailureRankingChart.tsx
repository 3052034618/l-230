import Chart from '@/components/ui/Chart';
import { useCorridorStore } from '@/store/useCorridorStore';
import { useEffect } from 'react';
import type { EChartsOption } from 'echarts';

export default function FailureRankingChart() {
  const { failureRanking, fetchRanking } = useCorridorStore();

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const option: EChartsOption = {
    grid: { left: 10, right: 50, top: 10, bottom: 10, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 12 },
      formatter: (params: unknown) => {
        const p = (params as { name: string; value: number; marker: string }[])[0];
        return `<div style="font-size:12px">
          <div style="margin-bottom:4px;font-weight:600">${p.name}</div>
          <div>${p.marker} 故障率: <b>${p.value.toFixed(2)}%</b></div>
        </div>`;
      },
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(100, 116, 139, 0.15)', type: 'dashed' } },
      axisLabel: { color: '#64748B', fontSize: 10, formatter: '{value}%' },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#94A3B8',
        fontSize: 11,
        formatter: (v: string) => (v.length > 10 ? v.slice(0, 10) + '...' : v),
      },
      data: failureRanking.map((item) => item.name),
    },
    series: [
      {
        type: 'bar',
        barWidth: 14,
        data: failureRanking.map((item) => ({
          value: Number(item.failureRate.toFixed(2)),
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#06B6D4' },
                { offset: 1, color: item.failureRate > 4 ? '#EF4444' : item.failureRate > 2.5 ? '#F59E0B' : '#10B981' },
              ],
            },
          },
          label: {
            show: true,
            position: 'right',
            color: '#94A3B8',
            fontSize: 11,
            fontFamily: 'JetBrains Mono',
            formatter: '{c}%',
          },
        })),
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(51, 65, 85, 0.3)',
          borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  };

  return <Chart option={option} height={340} />;
}
