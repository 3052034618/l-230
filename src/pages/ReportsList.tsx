import { useEffect, useState } from 'react';
import { getReports } from '@/services/report.service';
import type { OperationReport } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Clock,
  ChevronRight,
  Calendar,
  Loader2,
} from 'lucide-react';
import { cn, formatDate, formatNumber, formatPercent } from '@/utils/format';
import { Link } from 'react-router-dom';

export default function ReportsList() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<OperationReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getReports()
      .then((res) => {
        if (mounted) {
          setReports(res);
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            {user?.level === 'national' ? '全国' : user?.province || user?.city || user?.region || ''}运营健康诊断报告
          </h1>
          <p className="mt-1 text-sm text-slate-400">每周自动生成的管廊运营健康分析报告</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            自定义报告
          </Button>
        </div>
      </div>

      {reports.length > 0 && (
        <Card
          title={`${reports[0].region}运营健康诊断报告 · ${reports[0].year}年第${reports[0].weekNumber}周`}
          subtitle={`${formatDate(reports[0].startDate)} - ${formatDate(reports[0].endDate)}`}
          glow="cyan"
          rightElement={
            <Link to={`/reports/${reports[0].id}`}>
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
                  {formatNumber(reports[0].summary.avgHealthIndex, 1)}
                </span>
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-xs',
                    reports[0].summary.healthIndexWoW >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {reports[0].summary.healthIndexWoW >= 0 ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  {formatPercent(Math.abs(reports[0].summary.healthIndexWoW), 1)}
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
                {formatPercent(reports[0].summary.avgDeviceAvailability, 1)}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">全平台平均</div>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 text-xs text-amber-300">
                <AlertTriangle size={14} />
                本周预警数
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-amber-400">
                {reports[0].summary.totalAlerts}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">条预警记录</div>
            </div>

            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
              <div className="flex items-center gap-2 text-xs text-blue-300">
                <Clock size={14} />
                维护及时率
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-blue-400">
                {formatPercent(reports[0].summary.maintenanceTimelyRate, 1)}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">按计划完成</div>
            </div>
          </div>

          {reports[0].recommendations.length > 0 && (
            <div className="mt-5 rounded-lg border border-brand-500/30 bg-brand-500/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-brand-300">
                <TrendingUp size={14} />
                本周优化建议
              </div>
              <ul className="space-y-1">
                {reports[0].recommendations.map((rec, i) => (
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
