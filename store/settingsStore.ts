import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  themeMode: ThemeMode;
  remindersEnabled: boolean;
  billReminders: boolean;
  expenseAlerts: boolean;
  groceryReminders: boolean;
  rechargeAlerts: boolean;
  monthlyBudget: number;
  currency: string;
  setThemeMode: (mode: ThemeMode) => void;
  toggleReminders: () => void;
  toggleBillReminders: () => void;
  toggleExpenseAlerts: () => void;
  toggleGroceryReminders: () => void;
  toggleRechargeAlerts: () => void;
  setMonthlyBudget: (amount: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: 'dark',
  remindersEnabled: true,
  billReminders: true,
  expenseAlerts: true,
  groceryReminders: true,
  rechargeAlerts: true,
  monthlyBudget: 25000,
  currency: '₹',
  setThemeMode: (mode) => set({ themeMode: mode }),
  toggleReminders: () => set((s) => ({ remindersEnabled: !s.remindersEnabled })),
  toggleBillReminders: () => set((s) => ({ billReminders: !s.billReminders })),
  toggleExpenseAlerts: () => set((s) => ({ expenseAlerts: !s.expenseAlerts })),
  toggleGroceryReminders: () => set((s) => ({ groceryReminders: !s.groceryReminders })),
  toggleRechargeAlerts: () => set((s) => ({ rechargeAlerts: !s.rechargeAlerts })),
  setMonthlyBudget: (amount) => set({ monthlyBudget: amount }),
}));
