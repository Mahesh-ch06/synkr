import { create } from 'zustand';
import { Expense } from '../models/expense';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { supabase } from '../utils/supabase';
import { useAuthStore } from './authStore';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getMonthlyTotal: () => number;
  getCategoryTotals: () => Record<string, number>;
  getMonthlyExpenses: () => Expense[];
  getDailyAverage: () => number;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  isLoading: false,

  fetchExpenses: async () => {
    const userId = useAuthStore.getState().userId;
    if (!userId) return;

    set({ isLoading: true });
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
    } else if (data) {
      const formattedExpenses: Expense[] = data.map(dbExp => ({
        id: dbExp.id,
        title: dbExp.title,
        amount: dbExp.amount,
        category: dbExp.category,
        date: dbExp.date,
        notes: dbExp.notes || undefined,
        isRecurring: dbExp.is_recurring,
        createdAt: dbExp.created_at,
      }));
      set({ expenses: formattedExpenses });
    }
    set({ isLoading: false });
  },

  addExpense: async (expense: Expense) => {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
      // Fallback local UI if missing user
      set((s) => ({ expenses: [expense, ...s.expenses] })); 
      return;
    }

    set((s) => ({ expenses: [expense, ...s.expenses] }));

    const { error } = await supabase.from('expenses').insert({
      id: expense.id,
      user_id: userId,
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      notes: expense.notes,
      is_recurring: expense.isRecurring,
      created_at: expense.createdAt,
    });

    if (error) {
      console.error('Error adding expense:', error);
      set((s) => ({ expenses: s.expenses.filter((e) => e.id !== expense.id) }));
    }
  },

  updateExpense: async (id, updates) => {
    const userId = useAuthStore.getState().userId;
    
    let previousExpense: Expense | undefined;
    set((s) => {
      const expenses = [...s.expenses];
      const idx = expenses.findIndex(e => e.id === id);
      if (idx > -1) {
        previousExpense = { ...expenses[idx] };
        expenses[idx] = { ...expenses[idx], ...updates };
      }
      return { expenses };
    });

    if (!userId) return;

    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;

    const { error } = await supabase
      .from('expenses')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId);

    if (error && previousExpense) {
      console.error('Error updating expense:', error);
      set((s) => ({
        expenses: s.expenses.map((e) => (e.id === id ? previousExpense! : e)),
      }));
    }
  },

  deleteExpense: async (id) => {
    const userId = useAuthStore.getState().userId;

    let previousExpense: Expense | undefined;
    set((s) => {
      previousExpense = s.expenses.find(e => e.id === id);
      return { expenses: s.expenses.filter((e) => e.id !== id) };
    });

    if (!userId) return;

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error && previousExpense) {
      console.error('Error deleting expense:', error);
      set((s) => ({ expenses: [previousExpense!, ...s.expenses] }));
    }
  },

  getMonthlyTotal: () => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return get()
      .expenses.filter((e) => isWithinInterval(new Date(e.date), { start, end }))
      .reduce((sum, e) => sum + e.amount, 0);
  },
  getCategoryTotals: () => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const monthly = get().expenses.filter((e) =>
      isWithinInterval(new Date(e.date), { start, end })
    );
    const totals: Record<string, number> = {};
    monthly.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
  },
  getMonthlyExpenses: () => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return get().expenses.filter((e) =>
      isWithinInterval(new Date(e.date), { start, end })
    );
  },
  getDailyAverage: () => {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const total = get().getMonthlyTotal();
    return dayOfMonth > 0 ? Math.round(total / dayOfMonth) : 0;
  },
}));
