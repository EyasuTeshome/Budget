import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Budget, BudgetPeriod } from '../types';
import { Field, inputClass } from './FormControls';
import { todayISO } from '../lib/format';

const PERIODS: { value: BudgetPeriod; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

export default function BudgetForm({ initial, onDone }: { initial?: Budget; onDone: () => void }) {
  const categories = useLiveQuery(() => db.categories.where('type').equals('expense').toArray(), []) ?? [];

  const [categoryId, setCategoryId] = useState<number | undefined>(initial?.categoryId);
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [period, setPeriod] = useState<BudgetPeriod>(initial?.period ?? 'monthly');
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayISO());
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');

  async function handleSubmit() {
    const amt = parseFloat(amount);
    if (Number.isNaN(amt) || amt <= 0 || !categoryId) return;
    const payload: Omit<Budget, 'id'> = {
      categoryId,
      amount: amt,
      period,
      startDate,
      endDate: period === 'custom' ? endDate || undefined : undefined,
    };
    if (initial?.id) {
      await db.budgets.update(initial.id, payload);
    } else {
      await db.budgets.add(payload);
    }
    onDone();
  }

  async function handleDelete() {
    if (initial?.id) {
      await db.budgets.delete(initial.id);
      onDone();
    }
  }

  return (
    <div>
      <Field label="Category">
        <select className={inputClass} value={categoryId ?? ''} onChange={(e) => setCategoryId(Number(e.target.value))}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Budget amount">
        <input className={inputClass} type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Period">
        <select className={inputClass} value={period} onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}>
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Start date">
        <input className={inputClass} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </Field>
      {period === 'custom' && (
        <Field label="End date">
          <input className={inputClass} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </Field>
      )}
      <div className="mt-4 flex gap-2">
        {initial?.id && (
          <button onClick={handleDelete} className="flex-1 rounded-xl bg-rose-50 py-3 text-sm font-bold text-rose-600">
            Delete
          </button>
        )}
        <button onClick={handleSubmit} className="flex-1 rounded-xl bg-amber-400 py-3 text-sm font-bold text-white">
          Save
        </button>
      </div>
    </div>
  );
}
