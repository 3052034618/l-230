import { Router } from 'express';
import {
  MOCK_CORRIDORS,
  generateSensorData,
  generateSensorTrend,
  generateDevices,
  generateMaintenanceEvents,
} from '../data/mockData';

const router = Router();

router.get('/', (req, res) => {
  res.json(MOCK_CORRIDORS);
});

router.get('/:id', (req, res) => {
  const corridor = MOCK_CORRIDORS.find((c) => c.id === req.params.id);
  if (!corridor) {
    return res.status(404).json({ error: '管廊段不存在' });
  }
  res.json(corridor);
});

router.get('/:id/sensors', (req, res) => {
  res.json(generateSensorData(req.params.id));
});

router.get('/:id/sensors/trend', (req, res) => {
  const { type } = req.query;
  const sensorType = (type as string) || 'temperature';
  res.json(generateSensorTrend(req.params.id, sensorType));
});

router.get('/:id/devices', (req, res) => {
  res.json(generateDevices(req.params.id));
});

router.get('/:id/maintenance', (req, res) => {
  res.json(generateMaintenanceEvents(req.params.id));
});

export default router;
