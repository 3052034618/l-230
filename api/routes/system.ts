import { Router } from 'express';
import { MOCK_USERS } from '../data/mockData.js';

const router = Router();

router.use((req, res, next) => {
  if (!req.user || req.user.role !== 'hq_director') {
    return res.status(403).json({ error: '无权限访问系统管理接口' });
  }
  next();
});

router.get('/users', (req, res) => {
  res.json(MOCK_USERS);
});

export default router;
