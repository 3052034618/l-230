import { create } from 'zustand';
import type { Alert, AlertStatus } from '@/types';
import { getAlerts, handleAlert, approveAlert } from '@/services/alert.service';

interface AlertState {
  alerts: Alert[];
  isLoading: boolean;
  fetchAlerts: (params?: { status?: AlertStatus; level?: number }) => Promise<void>;
  handleAlert: (id: string, handler: string) => Promise<void>;
  approveAlert: (
    id: string,
    params: { stepId: string; status: 'approved' | 'rejected'; comment?: string; approver: string }
  ) => Promise<void>;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  isLoading: false,

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

  approveAlert: async (id, params) => {
    const updated = await approveAlert(id, params);
    set({
      alerts: get().alerts.map((a) => (a.id === id ? updated : a)),
    });
  },
}));
