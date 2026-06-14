import { Router } from 'express';
import { getReports, getReportById } from '../data/mockData.js';

const router = Router();

router.get('/', (req, res) => {
  const reports = getReports(req.user);
  res.json(reports);
});

router.get('/:id', (req, res) => {
  const report = getReportById(req.params.id, req.user);
  if (!report) {
    return res.status(404).json({ error: '报告不存在' });
  }
  res.json(report);
});

export default router;
