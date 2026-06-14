import api from './api';
import type { OperationReport } from '@/types';

interface ReportDrillParams {
  provinceCode?: string;
  cityCode?: string;
  corridorId?: string;
  drillDownLevel?: 'national' | 'provincial' | 'municipal' | 'corridor';
}

export async function getReports(drillParams?: ReportDrillParams) {
  const { data } = await api.get<OperationReport[]>('/reports', { params: drillParams });
  return data;
}

export async function getReport(id: string, drillParams?: ReportDrillParams) {
  const { data } = await api.get<OperationReport>(`/reports/${id}`, { params: drillParams });
  return data;
}
