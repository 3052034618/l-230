import { create } from 'zustand';
import type { User } from '@/types';
import { login as apiLogin, getCurrentUser } from '@/services/auth.service';
import { saveAuth, clearAuth, getStoredAuth } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  restoreAuth: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await apiLogin(username, password);
      saveAuth(token, user);
      set({ user, token, isLoading: false });
    } catch (e: unknown) {
      const error = e instanceof Error ? e.message : '登录失败';
      set({ error: error.includes('401') ? '用户名或密码错误' : error, isLoading: false });
      throw e;
    }
  },

  logout: () => {
    clearAuth();
    set({ user: null, token: null, error: null });
  },

  restoreAuth: () => {
    const { token, user } = getStoredAuth();
    if (token && user) {
      set({ token, user });
    }
  },

  fetchUser: async () => {
    try {
      const user = await getCurrentUser();
      set({ user });
    } catch {
      clearAuth();
      set({ user: null, token: null });
    }
  },
}));
