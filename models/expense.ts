export type ExpenseCategory =
  | 'food'
  | 'travel'
  | 'shopping'
  | 'groceries'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'bills'
  | 'rent'
  | 'other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
  isRecurring: boolean;
  createdAt: string;
}

export const ExpenseCategoryLabels: Record<ExpenseCategory, string> = {
  food: 'Food & Dining',
  travel: 'Travel & Transport',
  shopping: 'Shopping',
  groceries: 'Groceries',
  health: 'Health & Medical',
  education: 'Education',
  entertainment: 'Entertainment',
  bills: 'Bills & Utilities',
  rent: 'Rent & Housing',
  other: 'Other',
};

export const ExpenseCategoryIcons: Record<ExpenseCategory, string> = {
  food: 'food',
  travel: 'car',
  shopping: 'shopping',
  groceries: 'cart',
  health: 'hospital-box',
  education: 'school',
  entertainment: 'movie-open',
  bills: 'receipt',
  rent: 'home',
  other: 'dots-horizontal',
};
