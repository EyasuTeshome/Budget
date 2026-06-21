import { db } from '../db';
import { toISO, todayISO } from './format';
import type { Frequency } from '../types';

export function advanceDate(dateISO: string, frequency: Frequency, intervalDays?: number): string {
  const d = new Date(dateISO + 'T00:00:00');
  switch (frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'custom':
      d.setDate(d.getDate() + (intervalDays ?? 30));
      break;
  }
  return toISO(d);
}

/** Posts any recurring transactions and subscriptions whose nextDate has arrived, advancing them forward. */
export async function processDueRecurring() {
  const today = todayISO();

  const dueRecurring = (await db.recurring.toArray()).filter((r) => r.active);
  for (const r of dueRecurring) {
    if (!r.active) continue;
    let next = r.nextDate;
    let guard = 0;
    while (next <= today && guard < 365) {
      await db.transactions.add({
        date: next,
        amount: r.amount,
        type: r.type,
        accountId: r.accountId,
        categoryId: r.categoryId,
        note: r.name,
        recurringId: r.id,
      });
      next = advanceDate(next, r.frequency, r.intervalDays);
      guard++;
    }
    if (next !== r.nextDate && r.id) {
      await db.recurring.update(r.id, { nextDate: next });
    }
  }

  const dueSubs = (await db.subscriptions.toArray()).filter((s) => s.active);
  for (const s of dueSubs) {
    if (!s.active) continue;
    let next = s.nextBillingDate;
    let guard = 0;
    while (next <= today && guard < 365) {
      await db.transactions.add({
        date: next,
        amount: s.amount,
        type: 'expense',
        accountId: s.accountId,
        categoryId: s.categoryId,
        note: s.name,
        subscriptionId: s.id,
      });
      next = advanceDate(next, s.frequency, s.intervalDays);
      guard++;
    }
    if (next !== s.nextBillingDate && s.id) {
      await db.subscriptions.update(s.id, { nextBillingDate: next });
    }
  }
}
