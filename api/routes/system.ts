import { Router } from 'express';
import { MOCK_USERS } from '../data/mockData';

const router = Router();

router.get('/users', (req, res) => {
  res.json(MOCK_USERS);
});

export default router;
