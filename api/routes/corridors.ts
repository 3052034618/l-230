import { Router } from 'express';
import {
  MOCK_CORRIDORS,
  generateSensorData,
  generateSensorTrend,
  generateDevices,
  generateMaintenanceEvents,
  filterCorridorsByUser,
} from '../data/mockData.js';

const router = Router();

router.get('/', (req, res) => {
  const corridors = filterCorridorsByUser(req.user, MOCK_CORRIDORS);
  res.json(corridors);
});

router.get('/:id', (req, res) => {
  const corridor = MOCK_CORRIDORS.find((c) => c.id === req.params.id);
  if (!corridor) {
    return res.status(404).json({ error: '管廊段不存在' });
  }
  const filteredCorridors = filterCorridorsByUser(req.user, [corridor]);
  if (filteredCorridors.length === 0) {
    return res.status(403).json({ error: '无权限查看该管廊' });
  }
  res.json(corridor);
});

router.get('/:id/sensors', (req, res) => {
  const corridor = MOCK_CORRIDORS.find((c) => c.id === req.params.id);
  if (!corridor) {
    return res.status(404).json({ error: '管廊段不存在' });
  }
  const filteredCorridors = filterCorridorsByUser(req.user, [corridor]);
  if (filteredCorridors.length === 0) {
    return res.status(403).json({ error: '无权限查看该管廊' });
  }
  res.json(generateSensorData(req.params.id));
});

router.get('/:id/sensors/trend', (req, res) => {
  const corridor = MOCK_CORRIDORS.find((c) => c.id === req.params.id);
  if (!corridor) {
    return res.status(404).json({ error: '管廊段不存在' });
  }
  const filteredCorridors = filterCorridorsByUser(req.user, [corridor]);
  if (filteredCorridors.length === 0) {
    return res.status(403).json({ error: '无权限查看该管廊' });
  }
  const { type } = req.query;
  const sensorType = (type as string) || 'temperature';
  res.json(generateSensorTrend(req.params.id, sensorType));
});

router.get('/:id/devices', (req, res) => {
  const corridor = MOCK_CORRIDORS.find((c) => c.id === req.params.id);
  if (!corridor) {
    return res.status(404).json({ error: '管廊段不存在' });
  }
  const filteredCorridors = filterCorridorsByUser(req.user, [corridor]);
  if (filteredCorridors.length === 0) {
    return res.status(403).json({ error: '无权限查看该管廊' });
  }
  res.json(generateDevices(req.params.id));
});

router.get('/:id/maintenance', (req, res) => {
  const corridor = MOCK_CORRIDORS.find((c) => c.id === req.params.id);
  if (!corridor) {
    return res.status(404).json({ error: '管廊段不存在' });
  }
  const filteredCorridors = filterCorridorsByUser(req.user, [corridor]);
  if (filteredCorridors.length === 0) {
    return res.status(403).json({ error: '无权限查看该管廊' });
  }
  res.json(generateMaintenanceEvents(req.params.id));
});

export default router;
