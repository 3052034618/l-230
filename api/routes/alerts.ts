import { Router } from 'express';
import { MOCK_ALERTS, updateAlerts, filterAlertsByUser, addTimelineEvent, triggerGasAlert, markGasHandled } from '../data/mockData.js';
import type { AlertStatus } from '../../src/types';

const router = Router();

router.get('/', (req, res) => {
  updateAlerts();
  const { status, level } = req.query;
  let alerts = filterAlertsByUser(req.user, [...MOCK_ALERTS]);
  if (status) {
    alerts = alerts.filter((a) => a.status === (status as AlertStatus));
  }
  if (level) {
    alerts = alerts.filter((a) => a.level === parseInt(level as string, 10));
  }
  alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(alerts);
});

router.get('/:id', (req, res) => {
  updateAlerts();
  const alert = MOCK_ALERTS.find((a) => a.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ error: '预警不存在' });
  }
  const filteredAlerts = filterAlertsByUser(req.user, [alert]);
  if (filteredAlerts.length === 0) {
    return res.status(403).json({ error: '无权限查看该预警' });
  }
  res.json(alert);
});

router.post('/:id/handle', (req, res) => {
  const alert = MOCK_ALERTS.find((a) => a.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ error: '预警不存在' });
  }
  alert.status = 'closed';
  alert.handler = req.body.handler || '系统';

  if (alert.type === 'gas_exceed' && alert.sensorType) {
    markGasHandled(alert.corridorId, alert.sensorType);
  }

  addTimelineEvent(
    alert.id,
    'closed',
    alert.handler,
    '预警已关闭',
    req.body.result || '处置完成',
    undefined
  );

  res.json(alert);
});

router.post('/:id/start-process', (req, res) => {
  const alert = MOCK_ALERTS.find((a) => a.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ error: '预警不存在' });
  }
  const oldStatus = alert.status;
  alert.status = 'processing';
  alert.handler = req.body.handler || '系统';

  if (alert.type === 'gas_exceed' && alert.sensorType) {
    markGasHandled(alert.corridorId, alert.sensorType);
  }

  addTimelineEvent(
    alert.id,
    'status_changed',
    alert.handler,
    `预警状态从 ${oldStatus} 变更为 processing`,
    '开始处置',
    undefined
  );

  res.json(alert);
});

router.post('/:id/approve', (req, res) => {
  const alert = MOCK_ALERTS.find((a) => a.id === req.params.id);
  if (!alert || !alert.approvalFlow) {
    return res.status(404).json({ error: '预警或审批流程不存在' });
  }
  const { stepId, status, comment, approver } = req.body;
  const step = alert.approvalFlow.find((s) => s.id === stepId);
  if (!step) {
    return res.status(404).json({ error: '审批步骤不存在' });
  }
  step.status = status;
  step.comment = comment;
  step.approver = approver;
  step.approvedAt = new Date().toISOString();

  if (status === 'approved') {
    addTimelineEvent(
      alert.id,
      'approval',
      approver || '系统',
      `第${step.level}级审批通过`,
      comment,
      step.level
    );
  } else if (status === 'rejected') {
    addTimelineEvent(
      alert.id,
      'approval',
      approver || '系统',
      `第${step.level}级审批驳回`,
      comment,
      step.level
    );
  }

  if (status === 'rejected') {
    alert.status = 'rejected';
    addTimelineEvent(
      alert.id,
      'status_changed',
      approver || '系统',
      '预警审批被驳回，流程终止',
      '驳回原因: ' + (comment || '无'),
      undefined
    );
  } else {
    const allApproved = alert.approvalFlow.every((s) => s.status === 'approved');
    if (allApproved) {
      alert.status = 'approved';
      addTimelineEvent(
        alert.id,
        'status_changed',
        '系统',
        '三级审批全部通过，紧急排风系统已启动',
        '已联动启动管廊通风系统，预计30分钟内气体浓度恢复正常',
        undefined
      );
    }
  }

  res.json(alert);
});

router.post('/trigger', (req, res) => {
  const { corridorId, sensorType, durationMinutes, actualValue } = req.body;
  if (!corridorId || !sensorType) {
    return res.status(400).json({ error: '缺少必要参数 corridorId 或 sensorType' });
  }
  const alert = triggerGasAlert(
    corridorId,
    sensorType,
    durationMinutes || 10,
    actualValue || 30
  );
  if (!alert) {
    return res.status(404).json({ error: '管廊不存在' });
  }
  res.json(alert);
});

export default router;
