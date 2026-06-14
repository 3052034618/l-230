import { Router } from 'express';
import { MOCK_USERS } from '../data/mockData';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = MOCK_USERS.find((u) => u.username === username);
  if (!user || !password) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  const token = 'mock-token-' + user.id;
  res.json({ token, user });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: '未登录' });
  }
  const token = authHeader.replace('Bearer ', '');
  const userId = token.replace('mock-token-', '');
  const user = MOCK_USERS.find((u) => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: '无效的token' });
  }
  res.json(user);
});

export default router;
