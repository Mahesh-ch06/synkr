export type GroceryFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface GroceryItem {
  id: string;
  name: string;
  frequency: GroceryFrequency;
  lastPurchaseDate: string;
  nextPurchaseDate: string;
  quantity?: string;
  estimatedPrice?: number;
  category: string;
  autoRemind: boolean;
  createdAt: string;
}

export const GroceryFrequencyDays: Record<GroceryFrequency, number> = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};
