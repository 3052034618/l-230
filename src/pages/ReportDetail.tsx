import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  Home,
  Building2,
  MapPin,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { cn, formatDate, formatNumber, formatPercent } from '@/utils/format';
import type { EChartsOption } from 'echarts';

type DrillDownLevel = 'national' | 'provincial' | 'municipal' | 'corridor';

interface DrillParams {
  provinceCode?: string;
  cityCode?: string;
  corridorId?: string;
  drillDownLevel?: DrillDownLevel;
}

interface BreadcrumbItem {
  label: string;
  level: DrillDownLevel;
  icon: React.ReactNode;
  clickable: boolean;
  params?: DrillParams;
}

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [report, setReport] = useState<OperationReport | null>(null);
  const [loading, setLoading] = useState(true);

  const drillParams: DrillParams = useMemo(() => {
    const params: DrillParams = {};
    if (searchParams.get('provinceCode')) params.provinceCode = searchParams.get('provinceCode')!;
    if (searchParams.get('cityCode')) params.cityCode = searchParams.get('cityCode')!;
    if (searchParams.get('corridorId')) params.corridorId = searchParams.get('corridorId')!;
    if (searchParams.get('drillDownLevel')) params.drillDownLevel = searchParams.get('drillDownLevel') as DrillDownLevel;
    return params;
  }, [searchParams]);

  const currentLevel: DrillDownLevel = useMemo(() => {
    if (drillParams.drillDownLevel) return drillParams.drillDownLevel;
    if (report?.drillDownLevel) return report.drillDownLevel;
    return 'national';
  }, [drillParams.drillDownLevel, report]);

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

  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [];

    items.push({
      label: '全国',
      level: 'national',
      icon: <Home size={14} />,
      clickable: currentLevel !== 'national',
      params: { drillDownLevel: 'national' },
    });

    if (currentLevel === 'provincial' || currentLevel === 'municipal' || currentLevel === 'corridor') {
      const provinceName = report?.drillDownOptions?.provinces?.find(
        (p) => p.code === drillParams.provinceCode
      )?.name;
      if (provinceName) {
        items.push({
          label: provinceName,
          level: 'provincial',
          icon: <Building2 size={14} />,
          clickable: currentLevel !== 'provincial',
          params: { drillDownLevel: 'provincial', provinceCode: drillParams.provinceCode },
        });
      }
    }

    if (currentLevel === 'municipal' || currentLevel === 'corridor') {
      const cityName = report?.drillDownOptions?.cities?.find(
        (c) => c.code === drillParams.cityCode
      )?.name;
      if (cityName) {
        items.push({
          label: cityName,
          level: 'municipal',
          icon: <MapPin size={14} />,
          clickable: currentLevel !== 'municipal',
          params: {
            drillDownLevel: 'municipal',
            provinceCode: drillParams.provinceCode,
            cityCode: drillParams.cityCode,
          },
        });
      }
    }

    if (currentLevel === 'corridor' && drillParams.corridorId) {
      const corridorName = report?.drillDownOptions?.corridors?.find(
        (c) => c.id === drillParams.corridorId
      )?.name;
      if (corridorName) {
        items.push({
          label: corridorName,
          level: 'corridor',
          icon: <ChevronDown size={14} />,
          clickable: false,
        });
      }
    }

    return items;
  }, [report, currentLevel, drillParams]);

  const handleBreadcrumbClick = (crumb: BreadcrumbItem) => {
    if (!crumb.clickable || !crumb.params) return;
    const search = new URLSearchParams();
    Object.entries(crumb.params).forEach(([k, v]) => {
      if (v !== undefined) search.set(k, v);
    });
    navigate(`/reports?${search.toString()}`);
  };

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

  const handleDrillProvince = (code: string) => {
    const search = new URLSearchParams();
    search.set('drillDownLevel', 'provincial');
    search.set('provinceCode', code);
    navigate(`/reports?${search.toString()}`);
  };

  const handleDrillCity = (code: string) => {
    const search = new URLSearchParams();
    search.set('drillDownLevel', 'municipal');
    if (drillParams.provinceCode) search.set('provinceCode', drillParams.provinceCode);
    search.set('cityCode', code);
    navigate(`/reports?${search.toString()}`);
  };

  const handleDrillCorridor = (corridorId: string) => {
    const search = new URLSearchParams();
    search.set('drillDownLevel', 'corridor');
    if (drillParams.provinceCode) search.set('provinceCode', drillParams.provinceCode);
    if (drillParams.cityCode) search.set('cityCode', drillParams.cityCode);
    search.set('corridorId', corridorId);
    navigate(`/reports?${search.toString()}`);
  };

  const drillOptions = report.drillDownOptions;

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
            <div className="mb-2 flex items-center gap-1 text-xs text-slate-400">
              {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  {idx > 0 && <ChevronRight size={12} className="text-slate-600" />}
                  <button
                    type="button"
                    onClick={() => handleBreadcrumbClick(crumb)}
                    className={cn(
                      'flex items-center gap-1 rounded px-1.5 py-0.5 transition',
                      crumb.clickable
                        ? 'cursor-pointer text-slate-400 hover:bg-slate-800 hover:text-brand-300'
                        : 'cursor-default text-slate-300'
                    )}
                    disabled={!crumb.clickable}
                  >
                    {crumb.icon}
                    <span>{crumb.label}</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-white">
                {report.region}{report.year}年第{report.weekNumber}周运营健康诊断报告
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

      {currentLevel !== 'corridor' && drillOptions && (
        <Card
          title={
            currentLevel === 'national'
              ? '下钻分析·各省'
              : currentLevel === 'provincial'
                ? '下钻分析·各市'
                : '下钻分析·各管廊'
          }
          subtitle={
            currentLevel === 'national'
              ? '选择省份查看该区域运营健康状况'
              : currentLevel === 'provincial'
                ? '选择城市查看该区域运营健康状况'
                : '选择管廊查看运营健康状况'
          }
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentLevel === 'national' &&
              drillOptions.provinces?.map((province) => (
                <button
                  key={province.code}
                  type="button"
                  onClick={() => handleDrillProvince(province.code)}
                  className="group flex items-center justify-between rounded-xl border border-slate-700/60 bg-surface-900/40 p-4 text-left transition-all hover:border-brand-500/40 hover:bg-surface-800/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400 group-hover:bg-brand-500/30">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-white group-hover:text-brand-300">
                        {province.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        共 {province.corridorCount} 条管廊
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-600 opacity-0 transition group-hover:opacity-100 group-hover:text-brand-400"
                  />
                </button>
              ))}

            {currentLevel === 'provincial' &&
              drillOptions.cities?.map((city) => (
                <button
                  key={city.code}
                  type="button"
                  onClick={() => handleDrillCity(city.code)}
                  className="group flex items-center justify-between rounded-xl border border-slate-700/60 bg-surface-900/40 p-4 text-left transition-all hover:border-brand-500/40 hover:bg-surface-800/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/30">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-white group-hover:text-brand-300">
                        {city.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        共 {city.corridorCount} 条管廊
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-600 opacity-0 transition group-hover:opacity-100 group-hover:text-brand-400"
                  />
                </button>
              ))}

            {currentLevel === 'municipal' &&
              drillOptions.corridors?.map((corridor) => (
                <button
                  key={corridor.id}
                  type="button"
                  onClick={() => handleDrillCorridor(corridor.id)}
                  className="group flex items-center justify-between rounded-xl border border-slate-700/60 bg-surface-900/40 p-4 text-left transition-all hover:border-brand-500/40 hover:bg-surface-800/60"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        corridor.healthIndex >= 80
                          ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30'
                          : corridor.healthIndex >= 60
                            ? 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30'
                            : 'bg-red-500/20 text-red-400 group-hover:bg-red-500/30'
                      )}
                    >
                      <ChevronDown size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-white group-hover:text-brand-300">
                        {corridor.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        健康指数 {formatNumber(corridor.healthIndex, 1)}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-600 opacity-0 transition group-hover:opacity-100 group-hover:text-brand-400"
                  />
                </button>
              ))}
          </div>
        </Card>
      )}

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

      {report.topCorridors && report.topCorridors.length > 0 && (
        <Card
          title="TOP 管廊健康排名"
          subtitle="按健康指数排序的管廊列表"
          rightElement={<Badge variant="cyan">{report.topCorridors.length} 条</Badge>}
        >
          <div className="overflow-hidden rounded-lg border border-slate-700/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-900/60 text-left text-xs text-slate-400">
                  <th className="px-4 py-3 font-medium">排名</th>
                  <th className="px-4 py-3 font-medium">管廊名称</th>
                  <th className="px-4 py-3 font-medium">所属城市</th>
                  <th className="px-4 py-3 font-medium">健康指数</th>
                  <th className="px-4 py-3 font-medium">故障率</th>
                </tr>
              </thead>
              <tbody>
                {report.topCorridors.map((corridor, i) => (
                  <tr key={corridor.id} className="border-t border-slate-800/60 hover:bg-surface-800/30">
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                          i === 0
                            ? 'bg-amber-500/20 text-amber-400'
                            : i === 1
                              ? 'bg-slate-400/20 text-slate-300'
                              : i === 2
                                ? 'bg-orange-700/30 text-orange-400'
                                : 'bg-slate-700/40 text-slate-400'
                        )}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">{corridor.name}</td>
                    <td className="px-4 py-3 text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {corridor.city || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'font-mono',
                          corridor.healthIndex >= 80
                            ? 'text-emerald-400'
                            : corridor.healthIndex >= 60
                              ? 'text-amber-400'
                              : 'text-red-400'
                        )}
                      >
                        {formatNumber(corridor.healthIndex, 1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {formatPercent(corridor.failureRate, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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
