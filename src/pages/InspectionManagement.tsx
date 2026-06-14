import { useEffect, useState } from 'react';
import { getInspectionPlans, uploadInspectionPlan, getInspectionRoutes } from '@/services/inspection.service';
import type { InspectionPlan, InspectionRoute } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Upload, FileSpreadsheet, Calendar, MapPin, Package, User, ChevronDown, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { cn, formatDate, formatDateTime } from '@/utils/format';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InspectionManagement() {
  const [plans, setPlans] = useState<InspectionPlan[]>([]);
  const [routes, setRoutes] = useState<InspectionRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getInspectionPlans(), getInspectionRoutes()])
      .then(([plansData, routesData]) => {
        if (mounted) {
          setPlans(plansData);
          setRoutes(routesData);
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleUpload = async () => {
    if (!user) return;
    setUploading(true);
    try {
      const newPlan = await uploadInspectionPlan(user.name);
      setPlans([newPlan, ...plans]);
    } finally {
      setUploading(false);
    }
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
          <h1 className="font-display text-2xl font-bold text-white">巡检计划管理</h1>
          <p className="mt-1 text-sm text-slate-400">年度巡检计划上传、路线推荐与备件方案</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/inspection/risk">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight size={14} />}>
              风险预测与路线
            </Button>
          </Link>
          <Button
            onClick={handleUpload}
            disabled={uploading}
            leftIcon={uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          >
            {uploading ? '上传中...' : '上传巡检计划'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card
          title="巡检计划列表"
          subtitle="年度巡检计划管理与节点查看"
          className="xl:col-span-2"
          rightElement={
            <Badge variant="cyan">{plans.length} 个计划</Badge>
          }
        >
          <div className="space-y-3">
            {plans.map((plan) => {
              const isExpanded = expandedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  className="rounded-xl border border-slate-700/60 bg-surface-900/40 overflow-hidden"
                >
                  <div
                    className="flex cursor-pointer items-center justify-between p-4 transition hover:bg-surface-800/40"
                    onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
                        <FileSpreadsheet size={18} />
                      </div>
                      <div>
                        <div className="font-medium text-white">{plan.year}年度巡检计划</div>
                        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            上传于 {formatDateTime(plan.uploadedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={11} />
                            {plan.uploadedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          plan.status === 'approved'
                            ? 'success'
                            : plan.status === 'published'
                            ? 'cyan'
                            : 'warning'
                        }
                      >
                        {plan.status === 'draft'
                          ? '草稿'
                          : plan.status === 'approved'
                          ? '已批准'
                          : '已发布'}
                      </Badge>
                      <div className="text-xs text-slate-400">
                        {plan.nodes.length} 个巡检节点
                      </div>
                      {isExpanded ? (
                        <ChevronDown size={18} className="text-slate-500" />
                      ) : (
                        <ChevronRight size={18} className="text-slate-500" />
                      )}
                    </div>
                  </div>
                  {isExpanded && plan.nodes.length > 0 && (
                    <div className="border-t border-slate-700/60">
                      <div className="max-h-80 overflow-y-auto scrollbar-thin">
                        <table className="w-full text-xs">
                          <thead className="sticky top-0 bg-surface-900/90 text-slate-400 backdrop-blur">
                            <tr className="text-left">
                              <th className="px-4 py-2 font-medium">优先级</th>
                              <th className="px-4 py-2 font-medium">管廊段</th>
                              <th className="px-4 py-2 font-medium">计划日期</th>
                              <th className="px-4 py-2 font-medium">巡检人员</th>
                            </tr>
                          </thead>
                          <tbody>
                            {plan.nodes.map((node) => (
                              <tr
                                key={node.id}
                                className="border-t border-slate-800/60 text-slate-300 hover:bg-surface-800/40"
                              >
                                <td className="px-4 py-2.5">
                                  <Badge
                                    variant={
                                      node.priority === 'high'
                                        ? 'danger'
                                        : node.priority === 'medium'
                                        ? 'warning'
                                        : 'success'
                                    }
                                  >
                                    {node.priority === 'high'
                                      ? '高'
                                      : node.priority === 'medium'
                                      ? '中'
                                      : '低'}
                                  </Badge>
                                </td>
                                <td className="px-4 py-2.5">
                                  <Link
                                    to={`/corridor/${node.corridorId}`}
                                    className="transition hover:text-brand-400"
                                  >
                                    {node.corridorName}
                                  </Link>
                                </td>
                                <td className="px-4 py-2.5">{formatDate(node.plannedDate)}</td>
                                <td className="px-4 py-2.5">{node.inspector || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="推荐巡检路线" subtitle="基于风险预测的最优路径">
            <div className="space-y-4">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="font-medium text-white">{route.name}</div>
                    <Badge variant="cyan">推荐</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-slate-400">
                    <div>
                      <div className="text-slate-500">巡检日期</div>
                      <div className="mt-0.5 text-xs text-white">{formatDate(route.date)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">管廊数</div>
                      <div className="mt-0.5 text-xs text-white">{route.corridorCount}段</div>
                    </div>
                    <div>
                      <div className="text-slate-500">总时长</div>
                      <div className="mt-0.5 flex items-center gap-0.5 text-xs text-white">
                        <Clock size={11} />
                        {Math.floor(route.estimatedDuration / 60)}h
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 border-t border-slate-700/60 pt-3">
                    {route.stops.map((stop, i) => (
                      <div key={stop.corridorId} className="flex items-center gap-2 text-xs">
                        <div
                          className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                            i === 0
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : i === route.stops.length - 1
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-brand-500/20 text-brand-400'
                          )}
                        >
                          {i + 1}
                        </div>
                        <span className="flex-1 truncate text-slate-300">{stop.corridorName}</span>
                        <span className="text-[10px] text-slate-500">{stop.estimatedArrival}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" size="sm">
                查看全部路线
              </Button>
            </div>
          </Card>

          <Card title="备件储备方案" subtitle="推荐备件清单">
            {routes.length > 0 && routes[0].spareParts.length > 0 ? (
              <div className="space-y-2">
                {routes[0].spareParts.map((part) => (
                  <div
                    key={part.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-surface-900/40 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500/15 text-amber-400">
                        <Package size={14} />
                      </div>
                      <div>
                        <div className="text-sm text-white">{part.name}</div>
                        <div className="text-[10px] text-slate-500">
                          用于 {part.forCorridors.length} 个管廊段
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-sm font-bold text-brand-400">
                      {part.quantity} {part.unit}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-slate-500">暂无备件方案</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
