import api from './api';
import type { User } from '@/types';

export async function login(username: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>('/auth/login', { username, password });
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get<User>('/auth/me');
  return data;
}
