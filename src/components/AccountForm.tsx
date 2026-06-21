import { useState } from 'react';
import { db } from '../db';
import type { Account, AccountType } from '../types';
import { Field, inputClass, ColorPicker, IconPicker } from './FormControls';

const TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'stock', label: 'Stock' },
];

export default function AccountForm({ initial, onDone }: { initial?: Account; onDone: () => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<AccountType>(initial?.type ?? 'cash');
  const [startingBalance, setStartingBalance] = useState(
    initial ? String(initial.startingBalance) : '0',
  );
  const [color, setColor] = useState(initial?.color ?? 'emerald');
  const [icon, setIcon] = useState(initial?.icon ?? 'wallet');

  async function handleSubmit() {
    if (!name.trim()) return;
    const balance = parseFloat(startingBalance) || 0;
    if (initial?.id) {
      await db.accounts.update(initial.id, { name, type, startingBalance: balance, color, icon });
    } else {
      await db.accounts.add({ name, type, startingBalance: balance, color, icon });
    }
    onDone();
  }

  async function handleDelete() {
    if (initial?.id) {
      await db.accounts.delete(initial.id);
      onDone();
    }
  }

  return (
    <div>
      <Field label="Name">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chase Checking" />
      </Field>
      <Field label="Type">
        <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as AccountType)}>
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Starting balance">
        <input
          className={inputClass}
          type="number"
          inputMode="decimal"
          value={startingBalance}
          onChange={(e) => setStartingBalance(e.target.value)}
        />
      </Field>
      <Field label="Icon">
        <IconPicker value={icon} onChange={setIcon} />
      </Field>
      <Field label="Color">
        <ColorPicker value={color} onChange={setColor} />
      </Field>
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
