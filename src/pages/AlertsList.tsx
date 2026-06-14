import { useEffect, useState } from 'react';
import { useAlertStore } from '@/store/useAlertStore';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { AlertTriangle, Filter, Search, ChevronRight, Clock } from 'lucide-react';
import { cn, formatDateTime, getRelativeTime } from '@/utils/format';
import {
  ALERT_STATUS_LABELS,
  ALERT_TYPE_LABELS,
} from '@/utils/constants';
import type { AlertStatus, AlertLevel } from '@/types';

export default function AlertsList() {
  const { alerts, fetchAlerts, isLoading } = useAlertStore();
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState<AlertLevel | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAlerts(
      filterStatus === 'all' ? undefined : { status: filterStatus, level: filterLevel === 'all' ? undefined : filterLevel }
    );
  }, [fetchAlerts, filterStatus, filterLevel]);

  const filtered = alerts.filter(
    (a) =>
      (search === '' ||
        a.title.includes(search) ||
        a.corridorName.includes(search)) &&
      (filterLevel === 'all' || a.level === filterLevel) &&
      (filterStatus === 'all' || a.status === filterStatus)
  );

  const statusFilters: { value: AlertStatus | 'all'; label: string; count: number }[] = [
    { value: 'all', label: '全部', count: alerts.length },
    { value: 'pending', label: '待处理', count: alerts.filter((a) => a.status === 'pending').length },
    { value: 'processing', label: '处理中', count: alerts.filter((a) => a.status === 'processing').length },
    { value: 'escalated', label: '已升级', count: alerts.filter((a) => a.status === 'escalated').length },
    { value: 'approved', label: '已批准', count: alerts.filter((a) => a.status === 'approved').length },
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
            onClick={() => setFilterStatus(f.value)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
              filterStatus === f.value
                ? 'border-brand-500/50 bg-brand-500/15 text-brand-400'
                : 'border-slate-700/60 bg-surface-800/60 text-slate-400 hover:border-slate-600 hover:text-white'
            )}
          >
            {f.label}
            <span
              className={cn(
                'rounded px-1.5 py-0.5 text-[10px]',
                f.value === 'pending' || f.value === 'escalated'
                  ? 'bg-red-500/20 text-red-400'
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
                <th className="px-4 py-3 font-medium">触发时间</th>
                <th className="px-4 py-3 font-medium">截止时间</th>
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
                      pulse={alert.status === 'pending'}
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
                        alert.status === 'pending'
                          ? 'danger'
                          : alert.status === 'processing' || alert.status === 'escalated'
                          ? 'warning'
                          : alert.status === 'approved'
                          ? 'success'
                          : 'default'
                      }
                    >
                      {ALERT_STATUS_LABELS[alert.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-300">{getRelativeTime(alert.createdAt)}</div>
                    <div className="text-[10px] text-slate-500">{formatDateTime(alert.createdAt)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-slate-300">
                      <Clock size={12} />
                      {formatDateTime(alert.deadline)}
                    </div>
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
