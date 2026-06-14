import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAlert, handleAlert as handleAlertApi, approveAlert as approveAlertApi } from '@/services/alert.service';
import type { Alert } from '@/types';
import { ArrowLeft, AlertTriangle, Clock, MapPin, User, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { cn, formatDateTime, getRelativeTime } from '@/utils/format';
import {
  ALERT_STATUS_LABELS,
  ALERT_TYPE_LABELS,
  USER_ROLE_LABELS,
} from '@/utils/constants';
import { useAuthStore } from '@/store/useAuthStore';
import { canApproveLevel } from '@/utils/permission';
import { Link } from 'react-router-dom';

export default function AlertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    getAlert(id)
      .then((res) => mounted && setAlert(res))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleClose = async () => {
    if (!id || !user) return;
    setSubmitting(true);
    try {
      const updated = await handleAlertApi(id, user.name);
      setAlert(updated);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (stepId: string, approved: boolean) => {
    if (!id || !user) return;
    setSubmitting(true);
    try {
      const updated = await approveAlertApi(id, {
        stepId,
        status: approved ? 'approved' : 'rejected',
        comment,
        approver: user.name,
      });
      setAlert(updated);
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !alert) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
            返回列表
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-white">{alert.title}</h1>
              <Badge variant={alert.level === 2 ? 'danger' : 'warning'} pulse={alert.status === 'pending'}>
                <AlertTriangle size={12} />
                L{alert.level}级预警
              </Badge>
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
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="预警详情">
            <div className="space-y-4">
              <p className="text-sm text-slate-300">{alert.description}</p>

              <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface-900/50 p-4">
                <div>
                  <div className="text-xs text-slate-500">关联管廊</div>
                  <Link
                    to={`/corridor/${alert.corridorId}`}
                    className="mt-1 flex items-center gap-1 text-sm font-medium text-brand-400 transition hover:text-brand-300"
                  >
                    <MapPin size={14} />
                    {alert.corridorName}
                  </Link>
                </div>
                <div>
                  <div className="text-xs text-slate-500">预警类型</div>
                  <div className="mt-1 text-sm text-white">{ALERT_TYPE_LABELS[alert.type]}</div>
                </div>
                {alert.sensorType && (
                  <>
                    <div>
                      <div className="text-xs text-slate-500">触发传感器</div>
                      <div className="mt-1 text-sm text-white">{alert.sensorType.toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">阈值 / 实测</div>
                      <div className="mt-1 font-mono text-sm">
                        <span className="text-slate-400">{alert.thresholdValue}</span>
                        <span className="mx-2 text-slate-600">/</span>
                        <span className={cn(
                          'font-bold',
                          alert.actualValue && alert.thresholdValue && alert.actualValue >= alert.thresholdValue * 1.5
                            ? 'text-red-400'
                            : 'text-amber-400'
                        )}>
                          {alert.actualValue}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                {alert.durationMinutes && (
                  <div>
                    <div className="text-xs text-slate-500">持续时间</div>
                    <div className="mt-1 text-sm text-white">{alert.durationMinutes} 分钟</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-slate-500">触发时间</div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-white">
                    <Clock size={14} className="text-slate-500" />
                    {formatDateTime(alert.createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">处置截止</div>
                  <div className="mt-1 text-sm text-amber-400">
                    <Clock size={14} className="inline mr-1" />
                    {formatDateTime(alert.deadline)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {alert.approvalFlow && (
            <Card title="三级审批流程" subtitle="值班员确认 → 区域经理复核 → 总部运营总监批准">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-500 via-slate-700 to-slate-800" />
                  {alert.approvalFlow.map((step, i) => {
                    const canApprove = canApproveLevel(user, step.level);
                    const isCurrent = step.status === 'pending' &&
                      (i === 0 || alert.approvalFlow![i - 1].status === 'approved');
                    return (
                      <div key={step.id} className="relative pl-12 pb-6 last:pb-0">
                        <div
                          className={cn(
                            'absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2',
                            step.status === 'approved'
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                              : step.status === 'rejected'
                              ? 'border-red-500 bg-red-500/20 text-red-400'
                              : isCurrent
                              ? 'border-brand-500 bg-brand-500/20 text-brand-400 animate-pulse'
                              : 'border-slate-600 bg-surface-900 text-slate-500'
                          )}
                        >
                          {step.status === 'approved' ? (
                            <CheckCircle size={18} />
                          ) : step.status === 'rejected' ? (
                            <XCircle size={18} />
                          ) : (
                            <User size={18} />
                          )}
                        </div>
                        <div
                          className={cn(
                            'rounded-xl border p-4',
                            isCurrent
                              ? 'border-brand-500/40 bg-brand-500/5'
                              : 'border-slate-700/60 bg-surface-900/40'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display text-sm font-semibold text-white">
                                  第{step.level}级 · {USER_ROLE_LABELS[step.role]}
                                </span>
                                <Badge
                                  variant={
                                    step.status === 'approved'
                                      ? 'success'
                                      : step.status === 'rejected'
                                      ? 'danger'
                                      : 'default'
                                  }
                                >
                                  {step.status === 'approved'
                                    ? '已通过'
                                    : step.status === 'rejected'
                                    ? '已驳回'
                                    : '待审批'}
                                </Badge>
                              </div>
                              {step.requiredAction && (
                                <div className="mt-1 text-[11px] text-slate-500">
                                  建议措施: {step.requiredAction === 'ventilation' ? '启动紧急排风' : step.requiredAction === 'seal' ? '封闭管廊' : '现场勘查'}
                                </div>
                              )}
                            </div>
                            {step.approver && (
                              <div className="text-right">
                                <div className="text-xs text-white">{step.approver}</div>
                                <div className="text-[10px] text-slate-500">
                                  {step.approvedAt && getRelativeTime(step.approvedAt)}
                                </div>
                              </div>
                            )}
                          </div>
                          {step.comment && (
                            <div className="mt-3 rounded-lg bg-surface-800/60 p-3 text-xs text-slate-300">
                              {step.comment}
                            </div>
                          )}
                          {step.status === 'pending' && isCurrent && canApprove && (
                            <div className="mt-4 space-y-3 border-t border-slate-700/60 pt-4">
                              <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="请填写审批意见..."
                                rows={2}
                                className="w-full resize-none rounded-lg border border-slate-700/60 bg-surface-800/60 p-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApprove(step.id, false)}
                                  disabled={submitting}
                                  leftIcon={<XCircle size={14} />}
                                >
                                  驳回
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(step.id, true)}
                                  disabled={submitting}
                                  leftIcon={submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                >
                                  {submitting ? '提交中...' : '审批通过'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="快速处置">
            {alert.status === 'pending' || alert.status === 'processing' ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  {alert.level === 1
                    ? '一级预警需在2小时内完成处置，超时将自动升级为二级预警并启动三级审批流程。'
                    : '二级预警已启动三级审批流程，请按照流程进行审批。'}
                </p>
                {alert.level === 1 && (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={handleClose}
                      disabled={submitting}
                      leftIcon={submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    >
                      {submitting ? '提交中...' : '确认处置完成'}
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      联系现场人员
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-slate-500">
                <CheckCircle size={36} className="mb-2 text-emerald-500/60" />
                <p className="text-sm">预警已{ALERT_STATUS_LABELS[alert.status]}</p>
              </div>
            )}
          </Card>

          <Card title="处置时间线">
            <div className="space-y-3 text-xs">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-brand-500" />
                  <div className="w-px flex-1 bg-slate-700" />
                </div>
                <div>
                  <div className="text-white">预警触发</div>
                  <div className="text-slate-500">{formatDateTime(alert.createdAt)}</div>
                </div>
              </div>
              {alert.approvalFlow?.flatMap((step) =>
                step.approvedAt
                  ? [
                      <div key={step.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              'h-2 w-2 rounded-full',
                              step.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'
                            )}
                          />
                        </div>
                        <div>
                          <div className="text-white">
                            第{step.level}级{step.status === 'approved' ? '审批通过' : '审批驳回'} - {step.approver}
                          </div>
                          <div className="text-slate-500">{formatDateTime(step.approvedAt)}</div>
                        </div>
                      </div>,
                    ]
                  : []
              )}
              {alert.status === 'closed' && (
                <div className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <div>
                    <div className="text-white">预警关闭 - {alert.handler}</div>
                    <div className="text-slate-500">{formatDateTime(alert.deadline)}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
