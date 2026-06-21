import Dexie, { type Table } from 'dexie';
import type {
  Account,
  Category,
  Transaction,
  Budget,
  RecurringTransaction,
  Subscription,
} from './types';

class BudgetDB extends Dexie {
  accounts!: Table<Account, number>;
  categories!: Table<Category, number>;
  transactions!: Table<Transaction, number>;
  budgets!: Table<Budget, number>;
  recurring!: Table<RecurringTransaction, number>;
  subscriptions!: Table<Subscription, number>;

  constructor() {
    super('budget-app');
    this.version(1).stores({
      accounts: '++id, name, type',
      categories: '++id, name, type, parentId',
      transactions: '++id, date, accountId, categoryId, type',
      budgets: '++id, categoryId, period',
      recurring: '++id, nextDate',
      subscriptions: '++id, nextBillingDate',
    });
  }
}

export const db = new BudgetDB();

const defaultExpenseCategories: Category[] = [
  { name: 'Food', type: 'expense', color: 'amber', icon: 'utensils' },
  { name: 'Traffic', type: 'expense', color: 'sky', icon: 'car' },
  { name: 'Housing', type: 'expense', color: 'rose', icon: 'home' },
  { name: 'Recreation', type: 'expense', color: 'violet', icon: 'gamepad' },
  { name: 'Shopping', type: 'expense', color: 'pink', icon: 'bag' },
  { name: 'Health Care', type: 'expense', color: 'emerald', icon: 'heart' },
  { name: 'Subscriptions', type: 'expense', color: 'indigo', icon: 'repeat' },
];

const defaultIncomeCategories: Category[] = [
  { name: 'Salary', type: 'income', color: 'emerald', icon: 'wallet' },
  { name: 'Investment', type: 'income', color: 'amber', icon: 'trending-up' },
  { name: 'Part time', type: 'income', color: 'sky', icon: 'clock' },
];

export async function seedIfEmpty() {
  const count = await db.categories.count();
  if (count === 0) {
    await db.categories.bulkAdd([...defaultExpenseCategories, ...defaultIncomeCategories]);
  }
  const accCount = await db.accounts.count();
  if (accCount === 0) {
    await db.accounts.add({
      name: 'Cash',
      type: 'cash',
      startingBalance: 0,
      color: 'emerald',
      icon: 'wallet',
    });
  }
}
