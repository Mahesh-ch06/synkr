export interface RechargePlan {
  id: string;
  provider: string;
  amount: number;
  validity: number; // days
  dataPerDay: number; // GB
  totalData: number; // GB
  calls: string;
  sms: string;
  isPopular?: boolean;
}

export interface RechargeTracker {
  id: string;
  provider: string;
  currentPlan: RechargePlan;
  rechargeDate: string;
  expiryDate: string;
  dataUsedGB: number;
  totalDataGB: number;
  daysRemaining: number;
  estimatedExhaustionDate?: string;
}

export const PopularPlans: RechargePlan[] = [
  {
    id: 'jio-239',
    provider: 'Jio',
    amount: 239,
    validity: 28,
    dataPerDay: 1.5,
    totalData: 42,
    calls: 'Unlimited',
    sms: '100/day',
    isPopular: true,
  },
  {
    id: 'jio-299',
    provider: 'Jio',
    amount: 299,
    validity: 28,
    dataPerDay: 2,
    totalData: 56,
    calls: 'Unlimited',
    sms: '100/day',
    isPopular: true,
  },
  {
    id: 'airtel-265',
    provider: 'Airtel',
    amount: 265,
    validity: 28,
    dataPerDay: 1.5,
    totalData: 42,
    calls: 'Unlimited',
    sms: '100/day',
  },
  {
    id: 'airtel-299',
    provider: 'Airtel',
    amount: 299,
    validity: 28,
    dataPerDay: 2,
    totalData: 56,
    calls: 'Unlimited',
    sms: '100/day',
    isPopular: true,
  },
  {
    id: 'vi-269',
    provider: 'Vi',
    amount: 269,
    validity: 28,
    dataPerDay: 1.5,
    totalData: 42,
    calls: 'Unlimited',
    sms: '100/day',
  },
  {
    id: 'bsnl-247',
    provider: 'BSNL',
    amount: 247,
    validity: 30,
    dataPerDay: 2,
    totalData: 60,
    calls: 'Unlimited',
    sms: '100/day',
  },
];
