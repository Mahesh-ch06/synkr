export type BillCategory =
  | 'electricity'
  | 'rent'
  | 'wifi'
  | 'ott'
  | 'insurance'
  | 'water'
  | 'gas'
  | 'phone'
  | 'education'
  | 'other';

export type BillStatus = 'paid' | 'pending' | 'overdue';

export type RecurringInterval = 'monthly' | 'quarterly' | 'yearly';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: BillCategory;
  isAutopay: boolean;
  isRecurring: boolean;
  recurringInterval: RecurringInterval;
  status: BillStatus;
  paidDate?: string;
  notes?: string;
  remindDaysBefore: number;
  provider?: string;
  accountNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export const BillCategoryLabels: Record<BillCategory, string> = {
  electricity: 'Electricity',
  rent: 'Rent',
  wifi: 'WiFi / Internet',
  ott: 'OTT / Streaming',
  insurance: 'Insurance',
  water: 'Water',
  gas: 'Gas',
  phone: 'Phone',
  education: 'Education',
  other: 'Other',
};

export const BillCategoryIcons: Record<BillCategory, string> = {
  electricity: 'lightning-bolt',
  rent: 'home',
  wifi: 'wifi',
  ott: 'play-circle',
  insurance: 'shield-check',
  water: 'water',
  gas: 'fire',
  phone: 'cellphone',
  education: 'school',
  other: 'dots-horizontal',
};
