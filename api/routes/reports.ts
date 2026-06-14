import { Router } from 'express';
import { MOCK_REPORTS } from '../data/mockData';

const router = Router();

router.get('/', (req, res) => {
  res.json(MOCK_REPORTS);
});

router.get('/:id', (req, res) => {
  const report = MOCK_REPORTS.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: '报告不存在' });
  }
  res.json(report);
});

export default router;
