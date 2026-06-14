import { Router } from 'express';
import { getDashboardSummary, getHeatmapData, getFailureRanking } from '../data/mockData';

const router = Router();

router.get('/summary', (req, res) => {
  res.json(getDashboardSummary());
});

router.get('/heatmap', (req, res) => {
  res.json(getHeatmapData());
});

router.get('/failure-ranking', (req, res) => {
  const limit = parseInt((req.query.limit as string) || '10', 10);
  res.json(getFailureRanking(limit));
});

export default router;
