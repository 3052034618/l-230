import { Router } from 'express';
import { MOCK_INSPECTION_PLANS, MOCK_RISK_PREDICTIONS, MOCK_INSPECTION_ROUTES } from '../data/mockData';

const router = Router();

router.get('/plans', (req, res) => {
  res.json(MOCK_INSPECTION_PLANS);
});

router.post('/plans/upload', (req, res) => {
  const newPlan = {
    id: 'ip-' + Date.now(),
    year: 2026,
    uploadedAt: new Date().toISOString(),
    uploadedBy: req.body.uploadedBy || '系统',
    status: 'draft' as const,
    nodes: [],
  };
  MOCK_INSPECTION_PLANS.unshift(newPlan);
  res.json(newPlan);
});

router.get('/risk-predictions', (req, res) => {
  const { level } = req.query;
  let predictions = [...MOCK_RISK_PREDICTIONS];
  if (level) {
    predictions = predictions.filter((p) => p.riskLevel === level);
  }
  predictions.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.riskLevel] - order[b.riskLevel] || b.confidence - a.confidence;
  });
  res.json(predictions);
});

router.get('/routes', (req, res) => {
  res.json(MOCK_INSPECTION_ROUTES);
});

export default router;
