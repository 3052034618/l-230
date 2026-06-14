import { useEffect, useState, useMemo } from 'react';
import { getReports } from '@/services/report.service';
import type { OperationReport } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Clock,
  ChevronRight,
  ChevronDown,
  MapPin,
  Building2,
  Home,
  Calendar,
  Loader2,
} from 'lucide-react';
import { cn, formatDate, formatNumber, formatPercent } from '@/utils/format';
import { Link } from 'react-router-dom';

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

export default function ReportsList() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState<OperationReport[]>([]);
  const [loading, setLoading] = useState(true);

  const initialDrillParams: DrillParams = useMemo(() => {
    const params: DrillParams = {};
    const provinceCode = searchParams.get('provinceCode');
    const cityCode = searchParams.get('cityCode');
    const corridorId = searchParams.get('corridorId');
    const drillDownLevel = searchParams.get('drillDownLevel') as DrillDownLevel | null;
    if (provinceCode) params.provinceCode = provinceCode;
    if (cityCode) params.cityCode = cityCode;
    if (corridorId) params.corridorId = corridorId;
    if (drillDownLevel) params.drillDownLevel = drillDownLevel;
    return params;
  }, [searchParams]);

  const [drillParams, setDrillParamsState] = useState<DrillParams>(initialDrillParams);

  const setDrillParams = (params: DrillParams) => {
    setDrillParamsState(params);
    const sp: Record<string, string> = {};
    if (params.provinceCode) sp.provinceCode = params.provinceCode;
    if (params.cityCode) sp.cityCode = params.cityCode;
    if (params.corridorId) sp.corridorId = params.corridorId;
    if (params.drillDownLevel) sp.drillDownLevel = params.drillDownLevel;
    setSearchParams(sp);
  };

  const currentLevel: DrillDownLevel = useMemo(() => {
    if (drillParams.drillDownLevel) return drillParams.drillDownLevel;
    if (reports[0]?.drillDownLevel) return reports[0].drillDownLevel;
    if (user?.level) return user.level as DrillDownLevel;
    return 'national';
  }, [drillParams.drillDownLevel, reports, user]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getReports(Object.keys(drillParams).length > 0 ? drillParams : undefined)
      .then((res) => {
        if (mounted) {
          setReports(res);
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [drillParams]);

  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [];
    const latest = reports[0];

    items.push({
      label: '全国',
      level: 'national',
      icon: <Home size={14} />,
      clickable: currentLevel !== 'national',
      params: { drillDownLevel: 'national' },
    });

    if (currentLevel === 'provincial' || currentLevel === 'municipal' || currentLevel === 'corridor') {
      const provinceName = latest?.drillDownOptions?.provinces?.find(
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
      const cityName = latest?.drillDownOptions?.cities?.find(
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

    if (currentLevel === 'corridor') {
      const corridorName = latest?.drillDownOptions?.corridors?.find(
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

    if (items.length === 1 && latest?.region) {
      items[0].label = latest.region;
    }

    return items;
  }, [reports, currentLevel, drillParams]);

  const handleBreadcrumbClick = (crumb: BreadcrumbItem) => {
    if (!crumb.clickable || !crumb.params) return;
    setDrillParams(crumb.params);
  };

  const handleDrillProvince = (code: string, name: string) => {
    setDrillParams({
      drillDownLevel: 'provincial',
      provinceCode: code,
    });
  };

  const handleDrillCity = (code: string) => {
    setDrillParams({
      drillDownLevel: 'municipal',
      provinceCode: drillParams.provinceCode,
      cityCode: code,
    });
  };

  const handleDrillCorridor = (id: string) => {
    setDrillParams({
      drillDownLevel: 'corridor',
      provinceCode: drillParams.provinceCode,
      cityCode: drillParams.cityCode,
      corridorId: id,
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    );
  }

  const latestReport = reports[0];
  const drillOptions = latestReport?.drillDownOptions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
          <h1 className="font-display text-2xl font-bold text-white">
            {latestReport?.region || '全国'}运营健康诊断报告
          </h1>
          <p className="mt-1 text-sm text-slate-400">每周自动生成的管廊运营健康分析报告</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            自定义报告
          </Button>
        </div>
      </div>

      {currentLevel !== 'corridor' && drillOptions && (
        <Card
          title={
            currentLevel === 'national'
              ? '省级下钻'
              : currentLevel === 'provincial'
                ? '市级下钻'
                : '管廊下钻'
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
                  onClick={() => handleDrillProvince(province.code, province.name)}
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

      {reports.length > 0 && (
        <Card
          title={`${latestReport.region}运营健康诊断报告 · ${latestReport.year}年第${latestReport.weekNumber}周`}
          subtitle={`${formatDate(latestReport.startDate)} - ${formatDate(latestReport.endDate)}`}
          glow="cyan"
          rightElement={
            <Link to={`/reports/${latestReport.id}`}>
              <Button size="sm" rightIcon={<ChevronRight size={14} />}>
                查看详情
              </Button>
            </Link>
          }
        >
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <ShieldCheck size={14} />
                平均健康指数
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-emerald-400">
                  {formatNumber(latestReport.summary.avgHealthIndex, 1)}
                </span>
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-xs',
                    latestReport.summary.healthIndexWoW >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {latestReport.summary.healthIndexWoW >= 0 ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  {formatPercent(Math.abs(latestReport.summary.healthIndexWoW), 1)}
                </span>
              </div>
              <div className="mt-1 text-[10px] text-slate-500">环比上周</div>
            </div>

            <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-4">
              <div className="flex items-center gap-2 text-xs text-brand-300">
                <Activity size={14} />
                设备可用率
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-brand-400">
                {formatPercent(latestReport.summary.avgDeviceAvailability, 1)}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">全平台平均</div>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 text-xs text-amber-300">
                <AlertTriangle size={14} />
                本周预警数
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-amber-400">
                {latestReport.summary.totalAlerts}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">条预警记录</div>
            </div>

            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
              <div className="flex items-center gap-2 text-xs text-blue-300">
                <Clock size={14} />
                维护及时率
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-blue-400">
                {formatPercent(latestReport.summary.maintenanceTimelyRate, 1)}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">按计划完成</div>
            </div>
          </div>

          {latestReport.recommendations.length > 0 && (
            <div className="mt-5 rounded-lg border border-brand-500/30 bg-brand-500/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-brand-300">
                <TrendingUp size={14} />
                本周优化建议
              </div>
              <ul className="space-y-1">
                {latestReport.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      <Card title="历史报告" subtitle="全部周度运营健康诊断报告">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {reports.map((report) => (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              className="group rounded-xl border border-slate-700/60 bg-surface-900/40 p-4 transition-all hover:border-brand-500/40 hover:bg-surface-800/60"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400 group-hover:bg-brand-500/30">
                  <FileText size={18} />
                </div>
                <Badge variant="cyan">
                  {report.year}W{report.weekNumber}
                </Badge>
              </div>
              <div className="mt-3">
                <div className="font-medium text-white group-hover:text-brand-300">
                  {report.region}运营健康诊断报告
                </div>
                <div className="text-[11px] text-slate-400">
                  第{report.weekNumber}周
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                  <Calendar size={11} />
                  {formatDate(report.startDate)} - {formatDate(report.endDate)}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-700/50 pt-3 text-[11px]">
                <div>
                  <div className="text-slate-500">健康指数</div>
                  <div className="font-mono text-sm text-emerald-400">
                    {formatNumber(report.summary.avgHealthIndex, 1)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">预警数</div>
                  <div className="font-mono text-sm text-amber-400">
                    {report.summary.totalAlerts}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  生成于 {formatDate(report.generatedAt)}
                </span>
                <div className="flex items-center gap-1 text-xs text-brand-400 opacity-0 transition group-hover:opacity-100">
                  查看
                  <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
