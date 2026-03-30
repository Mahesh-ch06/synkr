export type SubscriptionCategory = 'streaming' | 'music' | 'cloud' | 'fitness' | 'news' | 'productivity' | 'gaming' | 'other';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  category: SubscriptionCategory;
  renewalDate: string;
  isActive: boolean;
  lastUsedDate?: string;
  logoUrl?: string;
  notes?: string;
  createdAt: string;
}

export const SubscriptionCategoryLabels: Record<SubscriptionCategory, string> = {
  streaming: 'Streaming',
  music: 'Music',
  cloud: 'Cloud Storage',
  fitness: 'Fitness',
  news: 'News',
  productivity: 'Productivity',
  gaming: 'Gaming',
  other: 'Other',
};

export const SubscriptionIcons: Record<string, string> = {
  Netflix: 'netflix',
  Spotify: 'spotify',
  'YouTube Premium': 'youtube',
  'Disney+ Hotstar': 'movie-open',
  'Amazon Prime': 'shopping',
  'iCloud': 'apple-icloud',
  'Google One': 'google-drive',
  Default: 'credit-card-clock',
};
