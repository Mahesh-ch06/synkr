import { create } from 'zustand';
import { Subscription } from '../models/subscription';
import { format, addDays } from 'date-fns';
import { supabase } from '../utils/supabase';
import { useAuthStore } from './authStore';

interface SubscriptionState {
  subscriptions: Subscription[];
  isLoading: boolean;
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (sub: Subscription) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  getMonthlyTotal: () => number;
  getUnusedSubscriptions: () => Subscription[];
  getUpcomingRenewals: (days: number) => Subscription[];
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  isLoading: false,

  fetchSubscriptions: async () => {
    const userId = useAuthStore.getState().userId;
    if (!userId) return;

    set({ isLoading: true });
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('renewal_date', { ascending: true });

    if (error) {
      console.error('Error fetching subscriptions:', error);
    } else if (data) {
      const formattedSubs: Subscription[] = data.map(dbSub => ({
        id: dbSub.id,
        name: dbSub.name,
        amount: dbSub.amount,
        billingCycle: dbSub.billing_cycle,
        category: dbSub.category,
        renewalDate: dbSub.renewal_date,
        isActive: dbSub.is_active,
        lastUsedDate: dbSub.last_used_date || undefined,
        logoUrl: dbSub.logo_url || undefined,
        notes: dbSub.notes || undefined,
        createdAt: dbSub.created_at,
      }));
      set({ subscriptions: formattedSubs });
    }
    set({ isLoading: false });
  },

  addSubscription: async (sub: Subscription) => {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
      set((s) => ({ subscriptions: [sub, ...s.subscriptions] }));
      return;
    }

    set((s) => ({ subscriptions: [sub, ...s.subscriptions] }));

    const { error } = await supabase.from('subscriptions').insert({
      id: sub.id,
      user_id: userId,
      name: sub.name,
      amount: sub.amount,
      billing_cycle: sub.billingCycle,
      category: sub.category,
      renewal_date: sub.renewalDate,
      is_active: sub.isActive,
      last_used_date: sub.lastUsedDate,
      logo_url: sub.logoUrl,
      notes: sub.notes,
      created_at: sub.createdAt,
    });

    if (error) {
      console.error('Error adding subscription:', error);
      set((s) => ({ subscriptions: s.subscriptions.filter((s) => s.id !== sub.id) }));
    }
  },

  updateSubscription: async (id, updates) => {
    const userId = useAuthStore.getState().userId;

    let previousSub: Subscription | undefined;
    set((s) => {
      const subscriptions = [...s.subscriptions];
      const idx = subscriptions.findIndex(sub => sub.id === id);
      if (idx > -1) {
        previousSub = { ...subscriptions[idx] };
        subscriptions[idx] = { ...subscriptions[idx], ...updates };
      }
      return { subscriptions };
    });

    if (!userId) return;

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.billingCycle !== undefined) dbUpdates.billing_cycle = updates.billingCycle;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.renewalDate !== undefined) dbUpdates.renewal_date = updates.renewalDate;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.lastUsedDate !== undefined) dbUpdates.last_used_date = updates.lastUsedDate;
    if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { error } = await supabase
      .from('subscriptions')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId);

    if (error && previousSub) {
      console.error('Error updating subscription:', error);
      set((s) => ({
        subscriptions: s.subscriptions.map((sub) => (sub.id === id ? previousSub! : sub)),
      }));
    }
  },

  deleteSubscription: async (id) => {
    const userId = useAuthStore.getState().userId;

    let previousSub: Subscription | undefined;
    set((s) => {
      previousSub = s.subscriptions.find(sub => sub.id === id);
      return { subscriptions: s.subscriptions.filter((sub) => sub.id !== id) };
    });

    if (!userId) return;

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error && previousSub) {
      console.error('Error deleting subscription:', error);
      set((s) => ({ subscriptions: [previousSub!, ...s.subscriptions] }));
    }
  },

  toggleActive: async (id) => {
    const userId = useAuthStore.getState().userId;

    let previousSub: Subscription | undefined;
    let newStatus = true;
    set((s) => {
      const subscriptions = [...s.subscriptions];
      const idx = subscriptions.findIndex(sub => sub.id === id);
      if (idx > -1) {
        previousSub = { ...subscriptions[idx] };
        newStatus = !subscriptions[idx].isActive;
        subscriptions[idx] = { ...subscriptions[idx], isActive: newStatus };
      }
      return { subscriptions };
    });

    if (!userId) return;

    const { error } = await supabase
      .from('subscriptions')
      .update({ is_active: newStatus })
      .eq('id', id)
      .eq('user_id', userId);

    if (error && previousSub) {
      console.error('Error toggling subscription:', error);
      set((s) => ({
        subscriptions: s.subscriptions.map((sub) => (sub.id === id ? previousSub! : sub)),
      }));
    }
  },

  getMonthlyTotal: () => {
    return get()
      .subscriptions.filter((s) => s.isActive)
      .reduce((sum, s) => {
        if (s.billingCycle === 'monthly') return sum + s.amount;
        if (s.billingCycle === 'quarterly') return sum + s.amount / 3;
        if (s.billingCycle === 'yearly') return sum + s.amount / 12;
        return sum;
      }, 0);
  },

  getUnusedSubscriptions: () => {
    const thirtyDaysAgo = addDays(new Date(), -30);
    return get().subscriptions.filter(
      (s) => s.isActive && s.lastUsedDate && new Date(s.lastUsedDate) < thirtyDaysAgo
    );
  },

  getUpcomingRenewals: (days) => {
    const cutoff = addDays(new Date(), days);
    return get()
      .subscriptions.filter(
        (s) => s.isActive && new Date(s.renewalDate) <= cutoff
      )
      .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
  },
}));
