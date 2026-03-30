import { create } from 'zustand';
import { User } from '../models/user';

interface AuthState {
  userId: string | null;
  setUserId: (id: string | null) => void;
  // Local user preferences (not in Clerk)
  localPreferences: {
    monthlyBudget: number;
    currency: string;
  };
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  updatePreferences: (updates: Partial<AuthState['localPreferences']>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  setUserId: (id) => set({ userId: id }),
  localPreferences: {
    monthlyBudget: 25000,
    currency: '₹',
  },
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  updatePreferences: (updates) =>
    set((s) => ({
      localPreferences: { ...s.localPreferences, ...updates },
    })),
}));
