import { create } from 'zustand';
import { Bill, BillStatus } from '../models/bill';
import { addDays, format } from 'date-fns';
import { supabase } from '../utils/supabase';
import { useAuthStore } from './authStore';

interface BillState {
  bills: Bill[];
  isLoading: boolean;
  fetchBills: () => Promise<void>;
  addBill: (bill: Bill) => Promise<void>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  markPaid: (id: string) => Promise<void>;
  getBillsByStatus: (status: BillStatus) => Bill[];
  getUpcomingBills: (days: number) => Bill[];
  getTotalPending: () => number;
}

export const useBillStore = create<BillState>((set, get) => ({
  bills: [],
  isLoading: false,

  fetchBills: async () => {
    const userId = useAuthStore.getState().userId;
    if (!userId) return;

    set({ isLoading: true });
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching bills:', error);
    } else if (data) {
      const formattedBills: Bill[] = data.map(dbBill => ({
        id: dbBill.id,
        name: dbBill.name,
        amount: dbBill.amount,
        dueDate: dbBill.due_date,
        category: dbBill.category,
        isAutopay: dbBill.is_autopay,
        isRecurring: dbBill.is_recurring,
        recurringInterval: dbBill.recurring_interval,
        status: dbBill.status,
        paidDate: dbBill.paid_date || undefined,
        remindDaysBefore: dbBill.remind_days_before,
        provider: dbBill.provider || undefined,
        accountNumber: dbBill.account_number || undefined,
        notes: dbBill.notes || undefined,
        createdAt: dbBill.created_at,
        updatedAt: dbBill.updated_at,
      }));
      set({ bills: formattedBills });
    }
    set({ isLoading: false });
  },

  addBill: async (bill: Bill) => {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
      set((s) => ({ bills: [bill, ...s.bills] }));
      return;
    }

    set((s) => ({ bills: [bill, ...s.bills] }));

    const { error } = await supabase.from('bills').insert({
      id: bill.id,
      user_id: userId,
      name: bill.name,
      amount: bill.amount,
      due_date: bill.dueDate,
      category: bill.category,
      is_autopay: bill.isAutopay,
      is_recurring: bill.isRecurring,
      recurring_interval: bill.recurringInterval,
      status: bill.status,
      paid_date: bill.paidDate,
      notes: bill.notes,
      remind_days_before: bill.remindDaysBefore,
      provider: bill.provider,
      account_number: bill.accountNumber,
      created_at: bill.createdAt,
      updated_at: bill.updatedAt,
    });

    if (error) {
      console.error('Error adding bill:', error);
      set((s) => ({ bills: s.bills.filter((b) => b.id !== bill.id) }));
    }
  },

  updateBill: async (id, updates) => {
    const userId = useAuthStore.getState().userId;
    const updatedAt = new Date().toISOString();

    let previousBill: Bill | undefined;
    set((s) => {
      const bills = [...s.bills];
      const idx = bills.findIndex(b => b.id === id);
      if (idx > -1) {
        previousBill = { ...bills[idx] };
        bills[idx] = { ...bills[idx], ...updates, updatedAt };
      }
      return { bills };
    });

    if (!userId) return;

    const dbUpdates: any = { updated_at: updatedAt };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.isAutopay !== undefined) dbUpdates.is_autopay = updates.isAutopay;
    if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
    if (updates.recurringInterval !== undefined) dbUpdates.recurring_interval = updates.recurringInterval;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.paidDate !== undefined) dbUpdates.paid_date = updates.paidDate;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.remindDaysBefore !== undefined) dbUpdates.remind_days_before = updates.remindDaysBefore;
    if (updates.provider !== undefined) dbUpdates.provider = updates.provider;
    if (updates.accountNumber !== undefined) dbUpdates.account_number = updates.accountNumber;

    const { error } = await supabase
      .from('bills')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId);

    if (error && previousBill) {
      console.error('Error updating bill:', error);
      set((s) => ({
        bills: s.bills.map((b) => (b.id === id ? previousBill! : b)),
      }));
    }
  },

  deleteBill: async (id) => {
    const userId = useAuthStore.getState().userId;

    let previousBill: Bill | undefined;
    set((s) => {
      previousBill = s.bills.find(b => b.id === id);
      return { bills: s.bills.filter((b) => b.id !== id) };
    });

    if (!userId) return;

    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error && previousBill) {
      console.error('Error deleting bill:', error);
      set((s) => ({ bills: [previousBill!, ...s.bills] }));
    }
  },

  markPaid: async (id) => {
    const userId = useAuthStore.getState().userId;
    const paidDate = format(new Date(), 'yyyy-MM-dd');
    const updatedAt = new Date().toISOString();

    let previousBill: Bill | undefined;
    set((s) => {
      const bills = [...s.bills];
      const idx = bills.findIndex(b => b.id === id);
      if (idx > -1) {
        previousBill = { ...bills[idx] };
        bills[idx] = { ...bills[idx], status: 'paid', paidDate, updatedAt };
      }
      return { bills };
    });

    if (!userId) return;

    const { error } = await supabase
      .from('bills')
      .update({ status: 'paid', paid_date: paidDate, updated_at: updatedAt })
      .eq('id', id)
      .eq('user_id', userId);

    if (error && previousBill) {
      console.error('Error marking bill paid:', error);
      set((s) => ({
        bills: s.bills.map((b) => (b.id === id ? previousBill! : b)),
      }));
    }
  },

  getBillsByStatus: (status) => get().bills.filter((b) => b.status === status),
  
  getUpcomingBills: (days) => {
    const cutoff = addDays(new Date(), days);
    return get().bills.filter(
      (b) => b.status === 'pending' && new Date(b.dueDate) <= cutoff
    );
  },
  
  getTotalPending: () =>
    get()
      .bills.filter((b) => b.status !== 'paid')
      .reduce((sum, b) => sum + b.amount, 0),
}));
