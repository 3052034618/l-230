import { create } from 'zustand';
import type { Alert, AlertStatus } from '@/types';
import { getAlerts, handleAlert, approveAlert, startProcessAlert, triggerGasAlert } from '@/services/alert.service';

interface AlertState {
  alerts: Alert[];
  isLoading: boolean;
  autoRefreshInterval: number | null;
  fetchAlerts: (params?: { status?: AlertStatus; level?: number }) => Promise<void>;
  handleAlert: (id: string, handler: string) => Promise<void>;
  startProcessAlert: (id: string, handler: string) => Promise<void>;
  approveAlert: (
    id: string,
    params: { stepId: string; status: 'approved' | 'rejected'; comment?: string; approver: string }
  ) => Promise<void>;
  triggerGasAlert: (params: {
    corridorId: string;
    sensorType: string;
    durationMinutes?: number;
    actualValue?: number;
  }) => Promise<Alert | undefined>;
  startAutoRefresh: (intervalMs?: number) => void;
  stopAutoRefresh: () => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  isLoading: false,
  autoRefreshInterval: null,

  fetchAlerts: async (params) => {
    set({ isLoading: true });
    try {
      const alerts = await getAlerts(params);
      set({ alerts });
    } finally {
      set({ isLoading: false });
    }
  },

  handleAlert: async (id: string, handler: string) => {
    const updated = await handleAlert(id, handler);
    set({
      alerts: get().alerts.map((a) => (a.id === id ? updated : a)),
    });
  },

  startProcessAlert: async (id: string, handler: string) => {
    const updated = await startProcessAlert(id, handler);
    set({
      alerts: get().alerts.map((a) => (a.id === id ? updated : a)),
    });
  },

  approveAlert: async (id, params) => {
    const updated = await approveAlert(id, params);
    set({
      alerts: get().alerts.map((a) => (a.id === id ? updated : a)),
    });
  },

  triggerGasAlert: async (params) => {
    try {
      const alert = await triggerGasAlert(params);
      await get().fetchAlerts();
      return alert;
    } catch (e) {
      return undefined;
    }
  },

  startAutoRefresh: (intervalMs = 30000) => {
    const { autoRefreshInterval, fetchAlerts } = get();
    if (autoRefreshInterval !== null) {
      clearInterval(autoRefreshInterval);
    }
    const interval = window.setInterval(() => {
      fetchAlerts();
    }, intervalMs);
    set({ autoRefreshInterval: interval });
  },

  stopAutoRefresh: () => {
    const { autoRefreshInterval } = get();
    if (autoRefreshInterval !== null) {
      clearInterval(autoRefreshInterval);
      set({ autoRefreshInterval: null });
    }
  },
}));
