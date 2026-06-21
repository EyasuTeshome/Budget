import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Transaction, TxType } from '../types';
import { Field, inputClass, Segmented } from './FormControls';
import { todayISO } from '../lib/format';
import { CategoryIcon } from './CategoryIcon';
import { getColor } from '../lib/colors';
import clsx from 'clsx';

interface Props {
  initial?: Transaction;
  onDone: () => void;
}

export default function TransactionForm({ initial, onDone }: Props) {
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const accounts = useLiveQuery(() => db.accounts.toArray(), []) ?? [];

  const [type, setType] = useState<TxType>(initial?.type ?? 'expense');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [categoryId, setCategoryId] = useState<number | undefined>(initial?.categoryId);
  const [accountId, setAccountId] = useState<number | undefined>(initial?.accountId);
  const effectiveAccountId = accountId ?? accounts[0]?.id;
  const [note, setNote] = useState(initial?.note ?? '');

  const filteredCategories = categories.filter((c) => c.type === type);

  async function handleSubmit() {
    const amt = parseFloat(amount);
    if (Number.isNaN(amt) || amt <= 0 || !categoryId || !effectiveAccountId) return;

    if (initial?.id) {
      await db.transactions.update(initial.id, { type, amount: amt, date, categoryId, accountId: effectiveAccountId, note });
    } else {
      await db.transactions.add({ type, amount: amt, date, categoryId, accountId: effectiveAccountId, note });
    }
    onDone();
  }

  async function handleDelete() {
    if (initial?.id) {
      await db.transactions.delete(initial.id);
      onDone();
    }
  }

  return (
    <div>
      <Segmented
        value={type}
        onChange={(v) => {
          setType(v);
          setCategoryId(undefined);
        }}
        options={[
          { value: 'expense', label: 'Expense' },
          { value: 'income', label: 'Income' },
        ]}
      />

      <Field label="Amount">
        <input
          className={inputClass}
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>

      <Field label="Date">
        <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>

      <Field label="Category">
        <div className="grid grid-cols-4 gap-2">
          {filteredCategories.map((c) => {
            const theme = getColor(c.color);
            const active = categoryId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={clsx(
                  'flex flex-col items-center gap-1 rounded-xl p-2 text-[11px] font-semibold',
                  active ? `${theme.bg} ring-2 ring-amber-400` : 'bg-slate-50',
                )}
              >
                <span className={clsx('flex h-8 w-8 items-center justify-center rounded-full', theme.iconBg, theme.iconText)}>
                  <CategoryIcon name={c.icon} size={15} />
                </span>
                <span className="truncate text-slate-600">{c.name}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Account">
        <select
          className={inputClass}
          value={effectiveAccountId ?? ''}
          onChange={(e) => setAccountId(Number(e.target.value))}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Note">
        <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
      </Field>

      <div className="mt-4 flex gap-2">
        {initial?.id && (
          <button
            onClick={handleDelete}
            className="flex-1 rounded-xl bg-rose-50 py-3 text-sm font-bold text-rose-600"
          >
            Delete
          </button>
        )}
        <button
          onClick={handleSubmit}
          className="flex-1 rounded-xl bg-amber-400 py-3 text-sm font-bold text-white shadow-sm active:scale-[0.98]"
        >
          Save
        </button>
      </div>
    </div>
  );
}
