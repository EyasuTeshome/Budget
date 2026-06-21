import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Subscription, Frequency } from '../types';
import { Field, inputClass, ColorPicker, IconPicker } from './FormControls';
import { todayISO } from '../lib/format';

const FREQS: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

export default function SubscriptionForm({
  initial,
  onDone,
}: {
  initial?: Subscription;
  onDone: () => void;
}) {
  const categories = useLiveQuery(() => db.categories.where('type').equals('expense').toArray(), []) ?? [];
  const accounts = useLiveQuery(() => db.accounts.toArray(), []) ?? [];

  const [name, setName] = useState(initial?.name ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [categoryId, setCategoryId] = useState<number | undefined>(initial?.categoryId);
  const [accountId, setAccountId] = useState<number | undefined>(initial?.accountId);
  const effectiveAccountId = accountId ?? accounts[0]?.id;
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? 'monthly');
  const [intervalDays, setIntervalDays] = useState(initial?.intervalDays ? String(initial.intervalDays) : '30');
  const [nextBillingDate, setNextBillingDate] = useState(initial?.nextBillingDate ?? todayISO());
  const [active, setActive] = useState(initial?.active ?? true);
  const [icon, setIcon] = useState(initial?.icon ?? 'repeat');
  const [color, setColor] = useState(initial?.color ?? 'indigo');

  async function handleSubmit() {
    const amt = parseFloat(amount);
    if (!name.trim() || Number.isNaN(amt) || amt <= 0 || !categoryId || !effectiveAccountId) return;
    const payload: Omit<Subscription, 'id'> = {
      name,
      amount: amt,
      categoryId,
      accountId: effectiveAccountId,
      frequency,
      intervalDays: frequency === 'custom' ? parseInt(intervalDays, 10) || 30 : undefined,
      nextBillingDate,
      active,
      icon,
      color,
    };
    if (initial?.id) {
      await db.subscriptions.update(initial.id, payload);
    } else {
      await db.subscriptions.add(payload);
    }
    onDone();
  }

  async function handleDelete() {
    if (initial?.id) {
      await db.subscriptions.delete(initial.id);
      onDone();
    }
  }

  return (
    <div>
      <Field label="Name">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Netflix" />
      </Field>
      <Field label="Amount">
        <input className={inputClass} type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
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
      <Field label="Account">
        <select className={inputClass} value={effectiveAccountId ?? ''} onChange={(e) => setAccountId(Number(e.target.value))}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Billing frequency">
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
      <Field label="Next billing date">
        <input className={inputClass} type="date" value={nextBillingDate} onChange={(e) => setNextBillingDate(e.target.value)} />
      </Field>
      <Field label="Icon">
        <IconPicker value={icon} onChange={setIcon} />
      </Field>
      <Field label="Color">
        <ColorPicker value={color} onChange={setColor} />
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
