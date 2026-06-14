import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport } from '@/services/report.service';
import type { OperationReport } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Chart from '@/components/ui/Chart';
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Clock,
  PieChart,
  Lightbulb,
  Calendar,
  Loader2,
} from 'lucide-react';
import { cn, formatDate, formatNumber, formatPercent } from '@/utils/format';
import type { EChartsOption } from 'echarts';

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<OperationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    getReport(id)
      .then((res) => mounted && setReport(res))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading || !report) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    );
  }

  const trendOption: EChartsOption = {
    grid: { left: 45, right: 20, top: 30, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 12 },
    },
    legend: {
      data: ['健康指数', '故障率'],
      right: 0,
      top: 0,
      textStyle: { color: '#94A3B8', fontSize: 11 },
      itemWidth: 12,
      itemHeight: 8,
    },
    xAxis: {
      type: 'category',
      data: report.trendComparison.map((t) => t.week),
      axisLine: { lineStyle: { color: '#334155' } },
      axisTick: { show: false },
      axisLabel: { color: '#64748B', fontSize: 10 },
    },
    yAxis: [
      {
        type: 'value',
        min: 80,
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#64748B', fontSize: 10, formatter: '{value}' },
        splitLine: { lineStyle: { color: 'rgba(100, 116, 139, 0.1)' } },
        name: '健康指数',
        nameTextStyle: { color: '#64748B', fontSize: 10 },
      },
      {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#64748B', fontSize: 10, formatter: '{value}%' },
        splitLine: { show: false },
        name: '故障率',
        nameTextStyle: { color: '#64748B', fontSize: 10 },
      },
    ],
    series: [
      {
        name: '健康指数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: report.trendComparison.map((t) => t.healthIndex),
        lineStyle: { color: '#06B6D4', width: 2.5 },
        itemStyle: { color: '#06B6D4', borderWidth: 2, borderColor: '#0F172A' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(6, 182, 212, 0.3)' },
              { offset: 1, color: 'rgba(6, 182, 212, 0)' },
            ],
          },
        },
      },
      {
        name: '故障率',
        type: 'bar',
        yAxisIndex: 1,
        barWidth: 14,
        data: report.trendComparison.map((t) => t.failureRate),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 158, 11, 0.8)' },
              { offset: 1, color: 'rgba(245, 158, 11, 0.2)' },
            ],
          },
          borderRadius: [3, 3, 0, 0],
        },
      },
    ],
  };

  const pieOption: EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 12 },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#94A3B8', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '72%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#0F172A',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, color: '#F8FAFC', fontSize: 12, fontWeight: 600 },
        },
        data: report.failureDistribution.map((d, i) => ({
          value: d.count,
          name: d.category,
          itemStyle: {
            color: ['#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][i % 5],
          },
        })),
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft size={16} />}
          >
            返回
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-white">
                {report.year}年第{report.weekNumber}周运营健康诊断报告
              </h1>
              <Badge variant="cyan">自动生成</Badge>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(report.startDate)} - {formatDate(report.endDate)}
              </span>
              <span>生成于 {formatDate(report.generatedAt)}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Download size={14} />}>
          导出PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-emerald-300">
            <ShieldCheck size={12} />
            平均健康指数
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold text-emerald-400">
              {formatNumber(report.summary.avgHealthIndex, 1)}
            </span>
            <span
              className={cn(
                'flex items-center text-[10px]',
                report.summary.healthIndexWoW >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {report.summary.healthIndexWoW >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {formatPercent(Math.abs(report.summary.healthIndexWoW), 1)} 环比
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-blue-300">
            <TrendingUp size={12} />
            健康指数同比
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span
              className={cn(
                'font-display text-2xl font-bold',
                report.summary.healthIndexYoY >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {report.summary.healthIndexYoY >= 0 ? '+' : ''}
              {formatPercent(report.summary.healthIndexYoY, 1)}
            </span>
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">较去年同期</div>
        </div>

        <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-brand-300">
            <Activity size={12} />
            设备可用率
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-brand-400">
            {formatPercent(report.summary.avgDeviceAvailability, 1)}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">全平台平均</div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-amber-300">
            <AlertTriangle size={12} />
            预警总数
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-amber-400">
            {report.summary.totalAlerts}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">本周累计</div>
        </div>

        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-purple-300">
            <Clock size={12} />
            维护及时率
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-purple-400">
            {formatPercent(report.summary.maintenanceTimelyRate, 1)}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">按SLA完成</div>
        </div>

        <div className="rounded-xl border border-slate-700/60 bg-surface-800/60 p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <PieChart size={12} />
            故障类别数
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-white">
            {report.failureDistribution.length}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">主要故障类型</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card
          title="健康指数与故障率趋势对比"
          subtitle="近6周数据趋势"
          className="xl:col-span-3"
        >
          <Chart option={trendOption} height={300} />
        </Card>

        <Card title="故障原因分布" subtitle="本周故障类型占比" className="xl:col-span-2">
          <Chart option={pieOption} height={280} />
        </Card>
      </div>

      <Card
        title="故障类型明细"
        rightElement={<Badge variant="cyan">{report.failureDistribution.reduce((s, d) => s + d.count, 0)} 起</Badge>}
      >
        <div className="overflow-hidden rounded-lg border border-slate-700/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-900/60 text-left text-xs text-slate-400">
                <th className="px-4 py-3 font-medium">故障类型</th>
                <th className="px-4 py-3 font-medium">发生次数</th>
                <th className="px-4 py-3 font-medium">占比</th>
                <th className="px-4 py-3 font-medium">分布</th>
              </tr>
            </thead>
            <tbody>
              {report.failureDistribution.map((item, i) => (
                <tr key={i} className="border-t border-slate-800/60 hover:bg-surface-800/30">
                  <td className="px-4 py-3 text-white">{item.category}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{item.count}</td>
                  <td className="px-4 py-3 font-mono text-brand-400">{item.percentage}%</td>
                  <td className="px-4 py-3">
                    <div className="h-2 w-40 overflow-hidden rounded-full bg-surface-900">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card
        title="优化策略建议"
        subtitle="基于本周数据分析的运营优化建议"
        glow="cyan"
        rightElement={
          <Badge variant="cyan">
            <Lightbulb size={12} />
            AI推荐
          </Badge>
        }
      >
        <div className="space-y-3">
          {report.recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-400">
                <Lightbulb size={16} />
              </div>
              <div>
                <div className="text-sm font-medium text-white">建议 {i + 1}</div>
                <div className="mt-0.5 text-sm text-slate-300">{rec}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
