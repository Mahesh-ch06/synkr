import { Bill } from '../../models/bill';
import { Expense } from '../../models/expense';
import { GroceryItem, GroceryFrequencyDays } from '../../models/grocery';
import { addDays, differenceInDays, format } from 'date-fns';

/**
 * Smart Engine — Rule-based prediction and suggestion logic
 * No ML, pure heuristics based on usage patterns
 */

// Predict next bill due date based on payment history
export const predictNextBillDate = (bill: Bill): string => {
  if (!bill.isRecurring) return bill.dueDate;

  const lastDate = new Date(bill.paidDate || bill.dueDate);
  let nextDate: Date;

  switch (bill.recurringInterval) {
    case 'monthly':
      nextDate = addDays(lastDate, 30);
      break;
    case 'quarterly':
      nextDate = addDays(lastDate, 90);
      break;
    case 'yearly':
      nextDate = addDays(lastDate, 365);
      break;
    default:
      nextDate = addDays(lastDate, 30);
  }

  return format(nextDate, 'yyyy-MM-dd');
};

// Estimate data consumption and exhaustion
export const estimateDataExhaustion = (
  totalDataGB: number,
  usedDataGB: number,
  totalDays: number,
  daysElapsed: number
): {
  dailyUsageGB: number;
  estimatedDaysLeft: number;
  willExhaustEarly: boolean;
  exhaustionDate: string;
} => {
  const dailyUsageGB = daysElapsed > 0 ? usedDataGB / daysElapsed : 0;
  const remainingDataGB = totalDataGB - usedDataGB;
  const estimatedDaysLeft = dailyUsageGB > 0 ? Math.floor(remainingDataGB / dailyUsageGB) : totalDays - daysElapsed;
  const daysRemaining = totalDays - daysElapsed;
  const willExhaustEarly = estimatedDaysLeft < daysRemaining;
  const exhaustionDate = format(addDays(new Date(), estimatedDaysLeft), 'yyyy-MM-dd');

  return { dailyUsageGB, estimatedDaysLeft, willExhaustEarly, exhaustionDate };
};

// Suggest monthly budget based on spending history
export const suggestBudget = (expenses: Expense[]): number => {
  if (expenses.length === 0) return 20000; // default for India

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgMonthly = totalSpent / Math.max(1, getUniqueMonths(expenses));

  // Suggest 110% of average (10% buffer)
  return Math.ceil(avgMonthly * 1.1 / 1000) * 1000; // Round to nearest 1000
};

const getUniqueMonths = (expenses: Expense[]): number => {
  const months = new Set(
    expenses.map((e) => e.date.substring(0, 7)) // YYYY-MM
  );
  return months.size || 1;
};

// Suggest grocery purchase based on frequency patterns
export const predictGroceryPurchase = (item: GroceryItem): {
  isDue: boolean;
  daysUntilDue: number;
  urgency: 'high' | 'medium' | 'low';
} => {
  const today = new Date();
  const nextPurchase = new Date(item.nextPurchaseDate);
  const daysUntilDue = differenceInDays(nextPurchase, today);
  
  let urgency: 'high' | 'medium' | 'low' = 'low';
  if (daysUntilDue <= 0) urgency = 'high';
  else if (daysUntilDue <= 2) urgency = 'medium';

  return {
    isDue: daysUntilDue <= 0,
    daysUntilDue,
    urgency,
  };
};

// Generate smart alerts based on current state
export interface SmartAlert {
  id: string;
  type: 'bill_due' | 'overdue' | 'budget_exceeded' | 'low_data' | 'unused_subscription' | 'grocery_due';
  title: string;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  icon: string;
  color: string;
  actionLabel?: string;
  actionRoute?: string;
}

export const generateSmartAlerts = (
  bills: Bill[],
  monthlySpent: number,
  monthlyBudget: number,
  unusedSubscriptionCount: number,
  groceryDueCount: number,
): SmartAlert[] => {
  const alerts: SmartAlert[] = [];

  // Overdue bills — critical
  const overdueBills = bills.filter((b) => b.status === 'overdue');
  overdueBills.forEach((bill) => {
    alerts.push({
      id: `alert-overdue-${bill.id}`,
      type: 'overdue',
      title: `${bill.name} is overdue!`,
      message: `₹${bill.amount.toLocaleString('en-IN')} was due. Late fees may apply.`,
      priority: 'critical',
      icon: 'alert-circle',
      color: '#FF6B6B',
      actionLabel: 'Pay Now',
      actionRoute: '/bills',
    });
  });

  // Bills due within 3 days — high
  const soonBills = bills.filter((b) => {
    if (b.status !== 'pending') return false;
    const days = differenceInDays(new Date(b.dueDate), new Date());
    return days >= 0 && days <= 3;
  });
  soonBills.forEach((bill) => {
    const days = differenceInDays(new Date(bill.dueDate), new Date());
    alerts.push({
      id: `alert-due-${bill.id}`,
      type: 'bill_due',
      title: `${bill.name} due ${days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`}`,
      message: `₹${bill.amount.toLocaleString('en-IN')} payment pending`,
      priority: 'high',
      icon: 'clock-alert-outline',
      color: '#FDCB6E',
      actionLabel: 'View Bill',
      actionRoute: '/bills',
    });
  });

  // Budget exceeded — high
  if (monthlySpent > monthlyBudget) {
    const overBy = monthlySpent - monthlyBudget;
    alerts.push({
      id: 'alert-budget-exceeded',
      type: 'budget_exceeded',
      title: 'Monthly budget exceeded!',
      message: `You've overspent by ₹${overBy.toLocaleString('en-IN')} this month.`,
      priority: 'high',
      icon: 'wallet-outline',
      color: '#FF7675',
      actionLabel: 'View Expenses',
      actionRoute: '/expenses',
    });
  } else if (monthlySpent > monthlyBudget * 0.85) {
    alerts.push({
      id: 'alert-budget-warning',
      type: 'budget_exceeded',
      title: 'Almost at budget limit',
      message: `₹${(monthlyBudget - monthlySpent).toLocaleString('en-IN')} remaining this month.`,
      priority: 'medium',
      icon: 'wallet-outline',
      color: '#FDCB6E',
      actionLabel: 'View Expenses',
      actionRoute: '/expenses',
    });
  }

  // Unused subscriptions — medium
  if (unusedSubscriptionCount > 0) {
    alerts.push({
      id: 'alert-unused-subs',
      type: 'unused_subscription',
      title: `${unusedSubscriptionCount} unused subscription${unusedSubscriptionCount > 1 ? 's' : ''}`,
      message: 'Consider cancelling subscriptions you haven\'t used in 30+ days.',
      priority: 'medium',
      icon: 'credit-card-clock-outline',
      color: '#A29BFE',
      actionLabel: 'Review',
      actionRoute: '/subscriptions',
    });
  }

  // Grocery items due — low 
  if (groceryDueCount > 0) {
    alerts.push({
      id: 'alert-grocery-due',
      type: 'grocery_due',
      title: `${groceryDueCount} grocery item${groceryDueCount > 1 ? 's' : ''} to buy`,
      message: 'Some essential items are due for purchase.',
      priority: 'low',
      icon: 'cart-outline',
      color: '#00B894',
      actionLabel: 'View List',
      actionRoute: '/grocery',
    });
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};
