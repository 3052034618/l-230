import { useEffect, useState } from 'react';
import { getRiskPredictions } from '@/services/inspection.service';
import type { RiskPrediction, Priority } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ShieldAlert, AlertTriangle, TrendingUp, MapPin, Calendar, Filter, Loader2, ArrowRight, ChevronRight } from 'lucide-react';
import { cn, formatDate, formatNumber } from '@/utils/format';
import { RISK_LEVEL_LABELS } from '@/utils/constants';
import { Link } from 'react-router-dom';

export default function RiskPredictionPage() {
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<Priority | 'all'>('all');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getRiskPredictions(filterLevel === 'all' ? undefined : filterLevel)
      .then((res) => mounted && setPredictions(res))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [filterLevel]);

  const riskColor = {
    high: 'border-red-500/40 bg-red-500/10 hover:border-red-500/60',
    medium: 'border-amber-500/40 bg-amber-500/10 hover:border-amber-500/60',
    low: 'border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-500/60',
  };

  const riskBadgeVariant = {
    high: 'danger' as const,
    medium: 'warning' as const,
    low: 'success' as const,
  };

  const stats = {
    high: predictions.filter((p) => p.riskLevel === 'high').length,
    medium: predictions.filter((p) => p.riskLevel === 'medium').length,
    low: predictions.filter((p) => p.riskLevel === 'low').length,
  };

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
          <h1 className="font-display text-2xl font-bold text-white">高风险管廊预测</h1>
          <p className="mt-1 text-sm text-slate-400">
            基于历史数据和传感器趋势，预测未来90天管廊风险等级
          </p>
        </div>
        <Link to="/inspection">
          <Button variant="outline" size="sm" rightIcon={<ChevronRight size={14} />}>
            巡检计划
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-red-300">高风险管廊</div>
            <ShieldAlert size={18} className="text-red-400" />
          </div>
          <div className="mt-2 font-display text-4xl font-bold text-red-400 text-glow-red">
            {stats.high}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">需立即安排巡检</div>
        </div>
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-amber-300">中风险管廊</div>
            <AlertTriangle size={18} className="text-amber-400" />
          </div>
          <div className="mt-2 font-display text-4xl font-bold text-amber-400">{stats.medium}</div>
          <div className="mt-1 text-[10px] text-slate-400">建议近期关注</div>
        </div>
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-emerald-300">低风险管廊</div>
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 font-display text-4xl font-bold text-emerald-400">{stats.low}</div>
          <div className="mt-1 text-[10px] text-slate-400">运行状态稳定</div>
        </div>
      </div>

      <Card
        title="风险预测列表"
        subtitle={`共 ${predictions.length} 个管廊段预测结果（未来90天）`}
        rightElement={
          <div className="flex items-center gap-1 rounded-lg border border-slate-700/60 bg-surface-800/60 px-2">
            <Filter size={14} className="text-slate-500" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as Priority | 'all')}
              className="h-8 bg-transparent px-2 text-xs text-slate-300 outline-none"
            >
              <option value="all">全部风险等级</option>
              <option value="high">高风险</option>
              <option value="medium">中风险</option>
              <option value="low">低风险</option>
            </select>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {predictions.map((p) => (
            <div
              key={p.corridorId}
              className={cn(
                'group relative rounded-xl border p-4 transition-all hover:shadow-xl',
                riskColor[p.riskLevel]
              )}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/corridor/${p.corridorId}`}
                    className="block truncate font-display text-base font-semibold text-white transition group-hover:text-brand-300"
                  >
                    {p.corridorName}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin size={11} />
                    {p.city}
                  </div>
                </div>
                <Badge variant={riskBadgeVariant[p.riskLevel]} pulse={p.riskLevel === 'high'}>
                  {RISK_LEVEL_LABELS[p.riskLevel]}
                </Badge>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">预测置信度</span>
                    <span className="font-mono text-white">{formatNumber(p.confidence, 0)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-900/60">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        p.riskLevel === 'high'
                          ? 'bg-gradient-to-r from-amber-500 to-red-500'
                          : p.riskLevel === 'medium'
                          ? 'bg-gradient-to-r from-brand-500 to-amber-500'
                          : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                      )}
                      style={{ width: `${p.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar size={11} />
                    上次巡检
                  </span>
                  <span className="text-slate-300">{formatDate(p.lastInspection)}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">历史故障次数</span>
                  <span className="font-mono text-white">{p.historicalFailures} 次</span>
                </div>
              </div>

              <div className="mt-3 border-t border-slate-700/40 pt-3">
                <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-2">
                  风险因素
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.riskFactors.map((factor, i) => (
                    <span
                      key={i}
                      className="rounded bg-surface-900/60 px-1.5 py-0.5 text-[10px] text-slate-300"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" rightIcon={<ArrowRight size={12} />}>
                  查看详情
                </Button>
                <Button size="sm" className="flex-1">
                  安排巡检
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
