import { Router } from 'express';
import { MOCK_ALERTS } from '../data/mockData';
import type { AlertStatus } from '../../src/types';

const router = Router();

router.get('/', (req, res) => {
  const { status, level } = req.query;
  let alerts = [...MOCK_ALERTS];
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
  const alert = MOCK_ALERTS.find((a) => a.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ error: '预警不存在' });
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
  const allApproved = alert.approvalFlow.every((s) => s.status === 'approved');
  if (allApproved) {
    alert.status = 'approved';
  }
  res.json(alert);
});

export default router;
