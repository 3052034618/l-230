import api from './api';
import type { Alert, AlertStatus } from '@/types';

export async function getAlerts(params?: { status?: AlertStatus; level?: number }) {
  const { data } = await api.get<Alert[]>('/alerts', { params });
  return data;
}

export async function getAlert(id: string) {
  const { data } = await api.get<Alert>(`/alerts/${id}`);
  return data;
}

export async function handleAlert(id: string, handler: string) {
  const { data } = await api.post<Alert>(`/alerts/${id}/handle`, { handler });
  return data;
}

export async function approveAlert(
  id: string,
  params: { stepId: string; status: 'approved' | 'rejected'; comment?: string; approver: string }
) {
  const { data } = await api.post<Alert>(`/alerts/${id}/approve`, params);
  return data;
}
