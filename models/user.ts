export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  monthlyBudget: number;
  currency: string;
  createdAt: string;
  lastLoginAt: string;
}
