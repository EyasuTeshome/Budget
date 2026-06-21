import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { RecurringTransaction, Frequency, TxType } from '../types';
import { Field, inputClass, Segmented } from './FormControls';
import { todayISO } from '../lib/format';

const FREQS: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

export default function RecurringForm({
  initial,
  onDone,
}: {
  initial?: RecurringTransaction;
  onDone: () => void;
}) {
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const accounts = useLiveQuery(() => db.accounts.toArray(), []) ?? [];

  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<TxType>(initial?.type ?? 'expense');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [categoryId, setCategoryId] = useState<number | undefined>(initial?.categoryId);
  const [accountId, setAccountId] = useState<number | undefined>(initial?.accountId ?? accounts[0]?.id);
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? 'monthly');
  const [intervalDays, setIntervalDays] = useState(initial?.intervalDays ? String(initial.intervalDays) : '30');
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayISO());
  const [active, setActive] = useState(initial?.active ?? true);

  const filteredCategories = categories.filter((c) => c.type === type);

  async function handleSubmit() {
    const amt = parseFloat(amount);
    if (!name.trim() || Number.isNaN(amt) || amt <= 0 || !categoryId || !accountId) return;
    const payload: Omit<RecurringTransaction, 'id'> = {
      name,
      type,
      amount: amt,
      categoryId,
      accountId,
      frequency,
      intervalDays: frequency === 'custom' ? parseInt(intervalDays, 10) || 30 : undefined,
      startDate,
      nextDate: initial?.nextDate ?? startDate,
      active,
    };
    if (initial?.id) {
      await db.recurring.update(initial.id, payload);
    } else {
      await db.recurring.add(payload);
    }
    onDone();
  }

  async function handleDelete() {
    if (initial?.id) {
      await db.recurring.delete(initial.id);
      onDone();
    }
  }

  return (
    <div>
      <Segmented value={type} onChange={(v) => { setType(v); setCategoryId(undefined); }} options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]} />
      <div className="mt-3" />
      <Field label="Name">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rent" />
      </Field>
      <Field label="Amount">
        <input className={inputClass} type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Category">
        <select className={inputClass} value={categoryId ?? ''} onChange={(e) => setCategoryId(Number(e.target.value))}>
          <option value="">Select category</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Account">
        <select className={inputClass} value={accountId ?? ''} onChange={(e) => setAccountId(Number(e.target.value))}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Frequency">
        <select className={inputClass} value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
          {FREQS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </Field>
      {frequency === 'custom' && (
        <Field label="Repeat every (days)">
          <input className={inputClass} type="number" value={intervalDays} onChange={(e) => setIntervalDays(e.target.value)} />
        </Field>
      )}
      <Field label="Start date">
        <input className={inputClass} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </Field>
      <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Active
      </label>
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
