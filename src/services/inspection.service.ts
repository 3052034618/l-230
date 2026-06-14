import api from './api';
import type { InspectionPlan, RiskPrediction, InspectionRoute, InspectionNode } from '@/types';

export async function getInspectionPlans() {
  const { data } = await api.get<InspectionPlan[]>('/inspection/plans');
  return data;
}

export async function uploadInspectionPlan(uploadedBy: string) {
  const { data } = await api.post<InspectionPlan>('/inspection/plans/upload', { uploadedBy });
  return data;
}

export async function uploadInspectionExcel(file: File): Promise<{ year: number; nodes: InspectionNode[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const { data } = await api.post<{ success: boolean; data: { year: number; nodes: InspectionNode[] } }>(
    '/inspection/upload',
    arrayBuffer,
    {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    }
  );
  return data.data;
}

export async function createInspectionPlan(params: {
  year: number;
  uploadedBy: string;
  nodes: InspectionNode[];
}): Promise<InspectionPlan> {
  const { data } = await api.post<InspectionPlan>('/inspection/plans', params);
  return data;
}

export async function getRiskPredictions(level?: 'high' | 'medium' | 'low') {
  const { data } = await api.get<RiskPrediction[]>('/inspection/risk-predictions', {
    params: level ? { level } : undefined,
  });
  return data;
}

export async function getInspectionRoutes() {
  const { data } = await api.get<InspectionRoute[]>('/inspection/routes');
  return data;
}
