export type TxType = 'expense' | 'income';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type BudgetPeriod = 'weekly' | 'monthly' | 'custom';
export type AccountType = 'cash' | 'debit' | 'credit' | 'mutual_fund' | 'stock';

export interface Account {
  id?: number;
  name: string;
  type: AccountType;
  startingBalance: number;
  color: string;
  icon: string;
  archived?: boolean;
}

export interface Category {
  id?: number;
  name: string;
  type: TxType;
  color: string;
  icon: string;
  parentId?: number | null;
}

export interface Transaction {
  id?: number;
  date: string; // ISO yyyy-mm-dd
  amount: number;
  type: TxType;
  accountId: number;
  categoryId: number;
  note?: string;
  recurringId?: number;
  subscriptionId?: number;
}

export interface Budget {
  id?: number;
  categoryId: number;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate?: string;
}

export interface RecurringTransaction {
  id?: number;
  name: string;
  amount: number;
  type: TxType;
  accountId: number;
  categoryId: number;
  frequency: Frequency;
  intervalDays?: number; // for custom frequency
  startDate: string;
  nextDate: string;
  active: boolean;
  note?: string;
}

export interface Subscription {
  id?: number;
  name: string;
  amount: number;
  accountId: number;
  categoryId: number;
  frequency: Frequency;
  intervalDays?: number;
  nextBillingDate: string;
  active: boolean;
  icon: string;
  color: string;
}
