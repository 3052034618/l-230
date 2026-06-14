import { Router, raw } from 'express';
import {
  MOCK_INSPECTION_PLANS,
  MOCK_RISK_PREDICTIONS,
  MOCK_INSPECTION_ROUTES,
  MOCK_CORRIDORS,
  filterPredictionsByUser,
  filterCorridorsByUser,
  addInspectionPlan,
} from '../data/mockData.js';
import { parseInspectionExcel } from '../utils/excelParser.js';
import type { InspectionNode } from '../../src/types/index.js';

const router = Router();
const rawParser = raw({
  type: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream',
  ],
  limit: '10mb',
});

function matchCorridorId(corridorName: string): string | undefined {
  const corridor = MOCK_CORRIDORS.find(
    (c) => c.name === corridorName || c.name.includes(corridorName) || corridorName.includes(c.name)
  );
  return corridor?.id;
}

function enrichNodesWithCorridorId(nodes: { corridorName: string; plannedDate: string; priority: 'high' | 'medium' | 'low'; inspector?: string; year?: number }[]): InspectionNode[] {
  return nodes.map((node, index) => {
    const corridorId = matchCorridorId(node.corridorName);
    return {
      id: `ipn-${Date.now()}-${index}`,
      corridorId: corridorId || `unknown-${index}`,
      corridorName: node.corridorName,
      plannedDate: node.plannedDate,
      priority: node.priority,
      inspector: node.inspector,
      year: node.year,
    };
  });
}

router.get('/plans', (req, res) => {
  const corridorIds = filterCorridorsByUser(req.user, MOCK_CORRIDORS).map((c) => c.id);
  const plans = MOCK_INSPECTION_PLANS.map((plan) => ({
    ...plan,
    nodes: plan.nodes.filter((node) => corridorIds.includes(node.corridorId)),
  }));
  res.json(plans);
});

router.post('/plans', (req, res) => {
  const { year, uploadedBy, nodes } = req.body;
  const enrichedNodes = enrichNodesWithCorridorId(nodes || []);
  const newPlan = addInspectionPlan({
    year: year,
    uploadedBy: uploadedBy || '系统',
    status: 'draft',
    nodes: enrichedNodes,
  });
  res.json(newPlan);
});

router.post('/plans/upload', (req, res) => {
  const { year, uploadedBy, nodes } = req.body;
  const enrichedNodes = enrichNodesWithCorridorId(nodes || []);
  const newPlan = addInspectionPlan({
    year: year,
    uploadedBy: uploadedBy || '系统',
    status: 'draft',
    nodes: enrichedNodes,
  });
  res.json(newPlan);
});

router.get('/risk-predictions', (req, res) => {
  const { level } = req.query;
  let predictions = filterPredictionsByUser(req.user, [...MOCK_RISK_PREDICTIONS]);
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
  const corridorIds = filterCorridorsByUser(req.user, MOCK_CORRIDORS).map((c) => c.id);
  const routes = MOCK_INSPECTION_ROUTES.map((route) => ({
    ...route,
    stops: route.stops.filter((stop) => corridorIds.includes(stop.corridorId)),
    spareParts: route.spareParts.filter((part) =>
      part.forCorridors.some((cid) => corridorIds.includes(cid))
    ),
  })).filter((route) => route.stops.length > 0);
  res.json(routes);
});

router.post('/upload', rawParser, (req, res) => {
  try {
    const buffer = req.body as Buffer;

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ success: false, error: '文件内容为空' });
    }

    const result = parseInspectionExcel(buffer);
    const enrichedNodes = enrichNodesWithCorridorId(result.nodes);
    res.json({
      success: true,
      data: {
        year: result.year,
        yearSource: result.yearSource,
        nodes: enrichedNodes,
      },
    });
  } catch (error) {
    console.error('Excel parse error:', error);
    res.status(500).json({ success: false, error: '文件解析失败' });
  }
});

export default router;
