import api from './api';
import type {
  CorridorSection,
  SensorData,
  SensorTrendPoint,
  Device,
  MaintenanceEvent,
  DashboardSummary,
  HeatmapPoint,
  FailureRankingItem,
} from '@/types';

export async function getCorridors() {
  const { data } = await api.get<CorridorSection[]>('/corridors');
  return data;
}

export async function getCorridor(id: string) {
  const { data } = await api.get<CorridorSection>(`/corridors/${id}`);
  return data;
}

export async function getCorridorSensors(id: string) {
  const { data } = await api.get<SensorData[]>(`/corridors/${id}/sensors`);
  return data;
}

export async function getSensorTrend(id: string, sensorType: string) {
  const { data } = await api.get<SensorTrendPoint[]>(`/corridors/${id}/sensors/trend`, {
    params: { type: sensorType },
  });
  return data;
}

export async function getCorridorDevices(id: string) {
  const { data } = await api.get<Device[]>(`/corridors/${id}/devices`);
  return data;
}

export async function getCorridorMaintenance(id: string) {
  const { data } = await api.get<MaintenanceEvent[]>(`/corridors/${id}/maintenance`);
  return data;
}

export async function getDashboardSummary() {
  const { data } = await api.get<DashboardSummary>('/dashboard/summary');
  return data;
}

export async function getHeatmapData() {
  const { data } = await api.get<HeatmapPoint[]>('/dashboard/heatmap');
  return data;
}

export async function getFailureRanking(limit = 10) {
  const { data } = await api.get<FailureRankingItem[]>('/dashboard/failure-ranking', {
    params: { limit },
  });
  return data;
}
