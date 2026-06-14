import { useEffect } from 'react';
import { useCorridorStore } from '@/store/useCorridorStore';
import { useAlertStore } from '@/store/useAlertStore';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import StatCard from '@/components/dashboard/StatCard';
import AlertFeed from '@/components/dashboard/AlertFeed';
import HealthHeatmap from '@/components/charts/HealthHeatmap';
import FailureRankingChart from '@/components/charts/FailureRankingChart';
import {
  Network,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Zap,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn, formatPercent, formatNumber } from '@/utils/format';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { summary, corridors, fetchAll, isLoading } = useCorridorStore();
  const { fetchAlerts } = useAlertStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
    fetchAlerts();
    const interval = setInterval(() => {
      fetchAll();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAll, fetchAlerts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">运营监控总览</h1>
          <p className="mt-1 text-sm text-slate-400">全国管廊实时运行状态 · 最后更新: {new Date().toLocaleTimeString('zh-CN')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="cyan" pulse>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            实时数据接入中
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={Network}
          label="管廊总数"
          value={summary?.totalCorridors || 0}
          suffix="段"
          color="cyan"
        />
        <StatCard
          icon={Zap}
          label="在线率"
          value={formatPercent(summary?.onlineRate || 0, 1)}
          change={0.8}
          changeLabel="较上周"
          color="emerald"
        />
        <StatCard
          icon={ShieldCheck}
          label="平均健康指数"
          value={formatNumber(summary?.avgHealthIndex || 0, 1)}
          change={0.5}
          changeLabel="环比"
          color="cyan"
          pulse
        />
        <StatCard
          icon={Activity}
          label="设备可用率"
          value={formatPercent(summary?.avgDeviceAvailability || 0, 1)}
          change={-0.3}
          changeLabel="环比"
          color="emerald"
        />
        <StatCard
          icon={AlertTriangle}
          label="当前预警"
          value={summary?.activeAlerts || 0}
          suffix="个"
          color={summary && summary.level2Alerts > 0 ? 'red' : 'amber'}
          pulse={summary && summary.activeAlerts > 0}
        >
          <div className="mt-3 flex gap-4 border-t border-slate-700/50 pt-3">
            <div>
              <div className="text-[10px] text-slate-500">一级预警</div>
              <div className="font-mono text-sm font-bold text-amber-400">
                {summary?.level1Alerts || 0}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">二级预警</div>
              <div className="font-mono text-sm font-bold text-red-400">
                {summary?.level2Alerts || 0}
              </div>
            </div>
          </div>
        </StatCard>
        <StatCard
          icon={TrendingUp}
          label="本周故障率"
          value={((corridors.reduce((s, c) => s + c.failureRate, 0) / (corridors.length || 1)).toFixed(2))}
          suffix="%"
          change={-0.2}
          changeLabel="较上周"
          color="blue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card
          title="全国管廊健康热力分布"
          subtitle="点击管廊点可下钻查看详情"
          className="xl:col-span-2"
          glow="cyan"
          rightElement={
            <div className="flex items-center gap-2">
              <Badge variant="cyan">热力图</Badge>
            </div>
          }
        >
          <HealthHeatmap />
        </Card>

        <Card
          title="实时预警动态"
          subtitle="最新预警处置状态"
          glow={summary && summary.level2Alerts > 0 ? 'red' : 'none'}
        >
          <AlertFeed />
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card
          title="故障率排名 TOP10"
          subtitle="按管廊段故障率排序"
          className="xl:col-span-2"
        >
          <FailureRankingChart />
        </Card>

        <Card title="管廊快速访问" subtitle="常用管廊段快捷入口">
          <div className="space-y-2 max-h-[340px] overflow-y-auto scrollbar-thin pr-1">
            {corridors.slice(0, 8).map((c) => (
              <Link
                key={c.id}
                to={`/corridor/${c.id}`}
                className="group flex items-center gap-3 rounded-lg border border-slate-700/50 p-3 transition-all hover:border-brand-500/40 hover:bg-surface-700/40"
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                    c.healthIndex >= 85
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                      : c.healthIndex >= 70
                      ? 'border-brand-500/40 bg-brand-500/15 text-brand-400'
                      : c.healthIndex >= 55
                      ? 'border-amber-500/40 bg-amber-500/15 text-amber-400'
                      : 'border-red-500/40 bg-red-500/15 text-red-400'
                  )}
                >
                  <ShieldCheck size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-white group-hover:text-brand-300">
                    {c.name}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {c.province} · {c.city}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      'font-mono text-base font-bold',
                      c.healthIndex >= 85
                        ? 'text-emerald-400'
                        : c.healthIndex >= 70
                        ? 'text-brand-400'
                        : c.healthIndex >= 55
                        ? 'text-amber-400'
                        : 'text-red-400'
                    )}
                  >
                    {c.healthIndex.toFixed(0)}
                  </div>
                  <div className="text-[10px] text-slate-500">健康指数</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/50">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/alerts')}
              size="sm"
            >
              查看全部预警
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
