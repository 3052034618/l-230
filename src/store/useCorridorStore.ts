import { create } from 'zustand';
import type { CorridorSection, DashboardSummary, HeatmapPoint, FailureRankingItem } from '@/types';
import { getCorridors, getDashboardSummary, getHeatmapData, getFailureRanking } from '@/services/corridor.service';

interface CorridorState {
  corridors: CorridorSection[];
  summary: DashboardSummary | null;
  heatmapData: HeatmapPoint[];
  failureRanking: FailureRankingItem[];
  isLoading: boolean;
  fetchAll: () => Promise<void>;
  fetchCorridors: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchHeatmap: () => Promise<void>;
  fetchRanking: () => Promise<void>;
}

export const useCorridorStore = create<CorridorState>((set, get) => ({
  corridors: [],
  summary: null,
  heatmapData: [],
  failureRanking: [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      await Promise.all([
        get().fetchCorridors(),
        get().fetchSummary(),
        get().fetchHeatmap(),
        get().fetchRanking(),
      ]);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCorridors: async () => {
    const corridors = await getCorridors();
    set({ corridors });
  },

  fetchSummary: async () => {
    const summary = await getDashboardSummary();
    set({ summary });
  },

  fetchHeatmap: async () => {
    const heatmapData = await getHeatmapData();
    set({ heatmapData });
  },

  fetchRanking: async () => {
    const failureRanking = await getFailureRanking();
    set({ failureRanking });
  },
}));
