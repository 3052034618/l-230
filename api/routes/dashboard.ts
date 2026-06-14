import { Router } from 'express';
import { getDashboardSummary, getHeatmapData, getFailureRanking, updateAlerts } from '../data/mockData.js';

const router = Router();

router.get('/summary', (req, res) => {
  updateAlerts();
  res.json(getDashboardSummary(req.user));
});

router.get('/heatmap', (req, res) => {
  updateAlerts();
  res.json(getHeatmapData(req.user));
});

router.get('/failure-ranking', (req, res) => {
  updateAlerts();
  const limit = parseInt((req.query.limit as string) || '10', 10);
  res.json(getFailureRanking(limit, req.user));
});

export default router;
