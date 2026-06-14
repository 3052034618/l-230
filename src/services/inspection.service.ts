import api from './api';
import type { InspectionPlan, RiskPrediction, InspectionRoute } from '@/types';

export async function getInspectionPlans() {
  const { data } = await api.get<InspectionPlan[]>('/inspection/plans');
  return data;
}

export async function uploadInspectionPlan(uploadedBy: string) {
  const { data } = await api.post<InspectionPlan>('/inspection/plans/upload', { uploadedBy });
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
