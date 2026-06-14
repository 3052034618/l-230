import { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useTheme } from '@/hooks/useTheme';

interface ChartProps {
  option: EChartsOption | Record<string, unknown>;
  height?: number | string;
  className?: string;
  onEvents?: Record<string, (params: unknown) => void>;
}

export default function Chart({ option, height = 320, className, onEvents }: ChartProps) {
  const chartRef = useRef<ReactECharts>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      chartRef.current?.getEchartsInstance().resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const defaultOption = {
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: "'Noto Sans SC', 'Space Grotesk', sans-serif",
      color: isDark ? '#94A3B8' : '#475569',
    },
  };

  return (
    <ReactECharts
      ref={chartRef}
      option={{ ...defaultOption, ...option } as EChartsOption}
      style={{ height, width: '100%' }}
      className={className}
      opts={{ renderer: 'canvas' }}
      onEvents={onEvents}
    />
  );
}
