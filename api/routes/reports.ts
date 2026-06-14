import { Router } from 'express';
import { getReports, getReportById } from '../data/mockData.js';

const router = Router();

router.get('/', (req, res) => {
  const { provinceCode, cityCode, corridorId, drillDownLevel } = req.query;
  const drillParams = {
    provinceCode: provinceCode as string | undefined,
    cityCode: cityCode as string | undefined,
    corridorId: corridorId as string | undefined,
    drillDownLevel: drillDownLevel as ('national' | 'provincial' | 'municipal' | 'corridor') | undefined,
  };
  const reports = getReports(req.user, drillParams);
  res.json(reports);
});

router.get('/:id', (req, res) => {
  const { provinceCode, cityCode, corridorId, drillDownLevel } = req.query;
  const drillParams = {
    provinceCode: provinceCode as string | undefined,
    cityCode: cityCode as string | undefined,
    corridorId: corridorId as string | undefined,
    drillDownLevel: drillDownLevel as ('national' | 'provincial' | 'municipal' | 'corridor') | undefined,
  };
  const directReports = getReports(req.user, Object.keys(drillParams).length > 0 ? drillParams : undefined);
  const report = getReportById(req.params.id, req.user) || directReports.find((r) => r.id === req.params.id) || directReports[0];
  if (!report) {
    return res.status(404).json({ error: '报告不存在' });
  }
  res.json(report);
});

export default router;
