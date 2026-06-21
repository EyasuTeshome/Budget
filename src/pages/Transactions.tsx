import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';
import { db } from '../db';
import MonthCalendar from '../components/MonthCalendar';
import Sheet from '../components/Sheet';
import TransactionForm from '../components/TransactionForm';
import { Segmented } from '../components/FormControls';
import { formatCurrency, toISO, todayISO } from '../lib/format';
import { getColor } from '../lib/colors';
import { CategoryIcon } from '../components/CategoryIcon';
import type { Transaction } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Transactions() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(todayISO());
  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | undefined>();

  const monthStart = toISO(new Date(month.getFullYear(), month.getMonth(), 1));
  const monthEnd = toISO(new Date(month.getFullYear(), month.getMonth() + 1, 0));

  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const accounts = useLiveQuery(() => db.accounts.toArray(), []) ?? [];
  const monthTx =
    useLiveQuery(
      () => db.transactions.where('date').between(monthStart, monthEnd, true, true).toArray(),
      [monthStart, monthEnd],
    ) ?? [];

  const totalsByDay = (() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const t of monthTx) {
      const cur = map.get(t.date) ?? { income: 0, expense: 0 };
      if (t.type === 'income') cur.income += t.amount;
      else cur.expense += t.amount;
      map.set(t.date, cur);
    }
    return map;
  })();

  const monthIncome = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const dayTx = monthTx.filter((t) => t.date === selected);

  const groupedAll = (() => {
    const groups = new Map<string, Transaction[]>();
    for (const t of monthTx.slice().sort((a, b) => (a.date < b.date ? 1 : -1))) {
      const arr = groups.get(t.date) ?? [];
      arr.push(t);
      groups.set(t.date, arr);
    }
    return groups;
  })();

  function catFor(id: number) {
    return categories.find((c) => c.id === id);
  }
  function accFor(id: number) {
    return accounts.find((a) => a.id === id);
  }

  function TxRow({ t }: { t: Transaction }) {
    const cat = catFor(t.categoryId);
    const theme = getColor(cat?.color ?? 'slate');
    return (
      <button
        onClick={() => setEditTx(t)}
        className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0"
      >
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.iconBg} ${theme.iconText}`}>
            <CategoryIcon name={cat?.icon ?? 'tag'} size={16} />
          </span>
          <div className="text-left">
            <div className="text-sm font-semibold text-slate-700">{cat?.name ?? 'Uncategorized'}</div>
            <div className="text-xs text-slate-400">{t.note || accFor(t.accountId)?.name}</div>
          </div>
        </div>
        <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {t.type === 'income' ? '+' : '-'}
          {formatCurrency(t.amount)}
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-1 flex-col pb-24">
      <div className="px-4 pt-4">
        <Segmented value={view} onChange={setView} options={[{ value: 'calendar', label: 'Calendar' }, { value: 'list', label: 'List' }]} />
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 px-4">
        <button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          className="rounded-full p-1 text-slate-400 active:bg-slate-100"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-bold text-slate-700">
          {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className="rounded-full p-1 text-slate-400 active:bg-slate-100"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-2 flex justify-around px-4 text-center text-xs">
        <div>
          <div className="font-bold text-emerald-500">{formatCurrency(monthIncome)}</div>
          <div className="text-slate-400">Income</div>
        </div>
        <div>
          <div className="font-bold text-rose-500">{formatCurrency(monthExpense)}</div>
          <div className="text-slate-400">Expense</div>
        </div>
        <div>
          <div className="font-bold text-slate-700">{formatCurrency(monthIncome - monthExpense)}</div>
          <div className="text-slate-400">Balance</div>
        </div>
      </div>

      {view === 'calendar' ? (
        <>
          <div className="mt-3 px-4">
            <MonthCalendar month={month} totals={totalsByDay} selected={selected} onSelect={setSelected} />
          </div>
          <div className="mt-4 px-4">
            <span className="mb-2 block text-sm font-bold text-slate-500">
              {new Date(selected + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {dayTx.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-400">No transactions</div>
              ) : (
                dayTx.map((t) => <TxRow key={t.id} t={t} />)
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 px-4">
          {[...groupedAll.entries()].map(([date, txs]) => (
            <div key={date} className="mb-4">
              <span className="mb-1 block text-xs font-bold text-slate-400">
                {new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                {txs.map((t) => (
                  <TxRow key={t.id} t={t} />
                ))}
              </div>
            </div>
          ))}
          {groupedAll.size === 0 && <div className="py-10 text-center text-sm text-slate-400">No transactions this month</div>}
        </div>
      )}

      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-24 right-6 z-20 rounded-full bg-amber-400 p-4 text-white shadow-lg active:scale-95"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <Sheet open={addOpen} title="Add Transaction" onClose={() => setAddOpen(false)}>
        <TransactionForm onDone={() => setAddOpen(false)} />
      </Sheet>
      <Sheet open={!!editTx} title="Edit Transaction" onClose={() => setEditTx(undefined)}>
        {editTx && <TransactionForm initial={editTx} onDone={() => setEditTx(undefined)} />}
      </Sheet>
    </div>
  );
}
