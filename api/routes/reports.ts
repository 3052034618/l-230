import { Router } from 'express';
import { MOCK_REPORTS, filterReportsByUser } from '../data/mockData.js';

const router = Router();

router.get('/', (req, res) => {
  const reports = filterReportsByUser(req.user, MOCK_REPORTS);
  res.json(reports);
});

router.get('/:id', (req, res) => {
  const report = MOCK_REPORTS.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: '报告不存在' });
  }
  const filteredReports = filterReportsByUser(req.user, [report]);
  if (filteredReports.length === 0) {
    return res.status(403).json({ error: '无权限查看该报告' });
  }
  res.json(report);
});

export default router;
