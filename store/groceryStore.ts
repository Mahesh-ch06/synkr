import { create } from 'zustand';
import { GroceryItem, GroceryFrequencyDays } from '../models/grocery';
import { format, addDays } from 'date-fns';
import { supabase } from '../utils/supabase';
import { useAuthStore } from './authStore';

interface GroceryState {
  items: GroceryItem[];
  isLoading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: GroceryItem) => Promise<void>;
  updateItem: (id: string, updates: Partial<GroceryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  markPurchased: (id: string) => Promise<void>;
  getDueItems: () => GroceryItem[];
  getUpcomingItems: (days: number) => GroceryItem[];
}

export const useGroceryStore = create<GroceryState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchItems: async () => {
    const userId = useAuthStore.getState().userId;
    if (!userId) return;

    set({ isLoading: true });
    const { data, error } = await supabase
      .from('groceries')
      .select('*')
      .eq('user_id', userId)
      .order('next_purchase_date', { ascending: true });

    if (error) {
      console.error('Error fetching groceries:', error);
    } else if (data) {
      const formattedItems: GroceryItem[] = data.map(dbGroc => ({
        id: dbGroc.id,
        name: dbGroc.name,
        frequency: dbGroc.frequency,
        lastPurchaseDate: dbGroc.last_purchase_date,
        nextPurchaseDate: dbGroc.next_purchase_date,
        quantity: dbGroc.quantity || undefined,
        estimatedPrice: dbGroc.estimated_price,
        category: dbGroc.category || undefined,
        autoRemind: dbGroc.auto_remind,
        createdAt: dbGroc.created_at,
      }));
      set({ items: formattedItems });
    }
    set({ isLoading: false });
  },

  addItem: async (item: GroceryItem) => {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
      set((s) => ({ items: [item, ...s.items] }));
      return;
    }

    set((s) => ({ items: [item, ...s.items] }));

    const { error } = await supabase.from('groceries').insert({
      id: item.id,
      user_id: userId,
      name: item.name,
      frequency: item.frequency,
      last_purchase_date: item.lastPurchaseDate,
      next_purchase_date: item.nextPurchaseDate,
      quantity: item.quantity,
      estimated_price: item.estimatedPrice,
      category: item.category,
      auto_remind: item.autoRemind,
      created_at: item.createdAt,
    });

    if (error) {
      console.error('Error adding grocery:', error);
      set((s) => ({ items: s.items.filter((i) => i.id !== item.id) }));
    }
  },

  updateItem: async (id, updates) => {
    const userId = useAuthStore.getState().userId;

    let previousItem: GroceryItem | undefined;
    set((s) => {
      const items = [...s.items];
      const idx = items.findIndex(i => i.id === id);
      if (idx > -1) {
        previousItem = { ...items[idx] };
        items[idx] = { ...items[idx], ...updates };
      }
      return { items };
    });

    if (!userId) return;

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
    if (updates.lastPurchaseDate !== undefined) dbUpdates.last_purchase_date = updates.lastPurchaseDate;
    if (updates.nextPurchaseDate !== undefined) dbUpdates.next_purchase_date = updates.nextPurchaseDate;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.estimatedPrice !== undefined) dbUpdates.estimated_price = updates.estimatedPrice;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.autoRemind !== undefined) dbUpdates.auto_remind = updates.autoRemind;

    const { error } = await supabase
      .from('groceries')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId);

    if (error && previousItem) {
      console.error('Error updating grocery:', error);
      set((s) => ({
        items: s.items.map((i) => (i.id === id ? previousItem! : i)),
      }));
    }
  },

  deleteItem: async (id) => {
    const userId = useAuthStore.getState().userId;

    let previousItem: GroceryItem | undefined;
    set((s) => {
      previousItem = s.items.find(i => i.id === id);
      return { items: s.items.filter((i) => i.id !== id) };
    });

    if (!userId) return;

    const { error } = await supabase
      .from('groceries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error && previousItem) {
      console.error('Error deleting grocery:', error);
      set((s) => ({ items: [previousItem!, ...s.items] }));
    }
  },

  markPurchased: async (id) => {
    const userId = useAuthStore.getState().userId;
    const now = new Date();

    let previousItem: GroceryItem | undefined;
    let nextDateStr = '';
    let lastDateStr = format(now, 'yyyy-MM-dd');

    set((s) => {
      const items = [...s.items];
      const idx = items.findIndex(i => i.id === id);
      if (idx > -1) {
        previousItem = { ...items[idx] };
        const item = items[idx];
        const nextDate = addDays(now, GroceryFrequencyDays[item.frequency]);
        nextDateStr = format(nextDate, 'yyyy-MM-dd');
        items[idx] = { ...item, lastPurchaseDate: lastDateStr, nextPurchaseDate: nextDateStr };
      }
      return { items };
    });

    if (!userId || !previousItem) return;

    const { error } = await supabase
      .from('groceries')
      .update({
        last_purchase_date: lastDateStr,
        next_purchase_date: nextDateStr,
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error && previousItem) {
      console.error('Error marking purchased:', error);
      set((s) => ({
        items: s.items.map((i) => (i.id === id ? previousItem! : i)),
      }));
    }
  },

  getDueItems: () => {
    const now = new Date();
    return get().items.filter((item) => new Date(item.nextPurchaseDate) <= now);
  },

  getUpcomingItems: (days) => {
    const cutoff = addDays(new Date(), days);
    return get()
      .items.filter((item) => new Date(item.nextPurchaseDate) <= cutoff)
      .sort((a, b) => new Date(a.nextPurchaseDate).getTime() - new Date(b.nextPurchaseDate).getTime());
  },
}));
