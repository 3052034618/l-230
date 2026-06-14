import { useEffect, useState } from 'react';
import { useAlertStore } from '@/store/useAlertStore';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { AlertTriangle, Filter, Search, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/format';
import {
  ALERT_STATUS_LABELS,
  ALERT_TYPE_LABELS,
} from '@/utils/constants';
import type { Alert, AlertLevel } from '@/types';

type GroupKey = 'all' | 'pending_approval' | 'processing' | 'rejected' | 'approved' | 'ventilation' | 'closed';

function getLastApprovalResult(alert: Alert): string {
  const events = [...alert.timeline]
    .filter((e) => e.type === 'approval' || e.type === 'status_changed')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  if (events.length === 0) return '-';
  const last = events[0];
  return last.result || last.description || '-';
}

function getVentilationResult(alert: Alert): string {
  const hasVentilation = alert.timeline.some(
    (e) => e.type === 'status_changed' && e.description.includes('紧急排风')
  );
  return hasVentilation ? '已启动' : '-';
}

function filterByGroup(alerts: Alert[], group: GroupKey): Alert[] {
  switch (group) {
    case 'all':
      return alerts;
    case 'pending_approval':
      return alerts.filter((a) => a.status === 'pending' || a.status === 'escalated');
    case 'processing':
      return alerts.filter((a) => a.status === 'processing');
    case 'rejected':
      return alerts.filter((a) => a.status === 'rejected');
    case 'approved':
      return alerts.filter((a) => a.status === 'approved');
    case 'ventilation':
      return alerts.filter((a) => a.status === 'approved');
    case 'closed':
      return alerts.filter((a) => a.status === 'closed');
    default:
      return alerts;
  }
}

export default function AlertsList() {
  const { alerts, fetchAlerts, isLoading } = useAlertStore();
  const [filterGroup, setFilterGroup] = useState<GroupKey>('all');
  const [filterLevel, setFilterLevel] = useState<AlertLevel | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const groupFiltered = filterByGroup(alerts, filterGroup);
  const filtered = groupFiltered.filter(
    (a) =>
      (search === '' ||
        a.title.includes(search) ||
        a.corridorName.includes(search)) &&
      (filterLevel === 'all' || a.level === filterLevel)
  );

  const statusFilters: { value: GroupKey; label: string; count: number }[] = [
    { value: 'all', label: '全部', count: alerts.length },
    { value: 'pending_approval', label: '待审批', count: alerts.filter((a) => a.status === 'pending' || a.status === 'escalated').length },
    { value: 'processing', label: '处理中', count: alerts.filter((a) => a.status === 'processing').length },
    { value: 'rejected', label: '已驳回', count: alerts.filter((a) => a.status === 'rejected').length },
    { value: 'approved', label: '已批准', count: alerts.filter((a) => a.status === 'approved').length },
    { value: 'ventilation', label: '已启动排风', count: alerts.filter((a) => a.status === 'approved').length },
    { value: 'closed', label: '已关闭', count: alerts.filter((a) => a.status === 'closed').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">预警管理中心</h1>
          <p className="mt-1 text-sm text-slate-400">
            共 {alerts.length} 条预警记录
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            导出记录
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterGroup(f.value)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
              filterGroup === f.value
                ? 'border-brand-500/50 bg-brand-500/15 text-brand-400'
                : 'border-slate-700/60 bg-surface-800/60 text-slate-400 hover:border-slate-600 hover:text-white'
            )}
          >
            {f.label}
            <span
              className={cn(
                'rounded px-1.5 py-0.5 text-[10px]',
                f.value === 'pending_approval'
                  ? 'bg-red-500/20 text-red-400'
                  : f.value === 'processing' || f.value === 'ventilation'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : f.value === 'approved'
                  ? 'bg-green-500/20 text-green-400'
                  : f.value === 'rejected'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-slate-700/60 text-slate-400'
              )}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-700/60 bg-surface-800/60 px-2">
            <Filter size={14} className="text-slate-500" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as AlertLevel | 'all')}
              className="h-8 bg-transparent px-2 text-xs text-slate-300 outline-none"
            >
              <option value="all">全部等级</option>
              <option value={1}>一级预警</option>
              <option value={2}>二级预警</option>
            </select>
          </div>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索预警标题、管廊名称..."
            className="h-9 w-64 rounded-lg border border-slate-700/60 bg-surface-800/60 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/60 text-left text-xs text-slate-400">
                <th className="px-4 py-3 font-medium">等级</th>
                <th className="px-4 py-3 font-medium">预警信息</th>
                <th className="px-4 py-3 font-medium">管廊段</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">最后审批结论</th>
                <th className="px-4 py-3 font-medium">排风联动结果</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    暂无预警数据
                  </td>
                </tr>
              )}
              {filtered.map((alert) => (
                <tr
                  key={alert.id}
                  className="border-b border-slate-800/60 text-sm transition-colors hover:bg-surface-700/30"
                >
                  <td className="px-4 py-3">
                    <Badge
                      variant={alert.level === 2 ? 'danger' : 'warning'}
                      pulse={alert.status === 'pending' || alert.status === 'escalated'}
                    >
                      <AlertTriangle size={11} />
                      L{alert.level}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{alert.title}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {alert.description.length > 40
                        ? alert.description.slice(0, 40) + '...'
                        : alert.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <Link
                      to={`/corridor/${alert.corridorId}`}
                      className="text-slate-300 transition hover:text-brand-400"
                    >
                      {alert.corridorName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {ALERT_TYPE_LABELS[alert.type]}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        alert.status === 'pending' || alert.status === 'escalated'
                          ? 'danger'
                          : alert.status === 'processing'
                          ? 'warning'
                          : alert.status === 'approved'
                          ? 'success'
                          : alert.status === 'rejected'
                          ? 'danger'
                          : 'default'
                      }
                    >
                      {ALERT_STATUS_LABELS[alert.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {getLastApprovalResult(alert)}
                  </td>
                  <td className="px-4 py-3">
                    {getVentilationResult(alert) === '已启动' ? (
                      <Badge variant="warning">已启动</Badge>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/alerts/${alert.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-400 transition hover:text-brand-300"
                    >
                      查看详情
                      <ChevronRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
