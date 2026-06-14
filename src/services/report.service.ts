import api from './api';
import type { OperationReport } from '@/types';

export async function getReports() {
  const { data } = await api.get<OperationReport[]>('/reports');
  return data;
}

export async function getReport(id: string) {
  const { data } = await api.get<OperationReport>(`/reports/${id}`);
  return data;
}
