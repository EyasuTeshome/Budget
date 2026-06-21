import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';
import { db } from '../db';
import PeriodHeader from '../components/PeriodHeader';
import CategoryCard from '../components/CategoryCard';
import Sheet from '../components/Sheet';
import TransactionForm from '../components/TransactionForm';
import { usePeriodRange } from '../lib/period';
import { formatCurrency } from '../lib/format';
import type { Transaction } from '../types';

export default function Home() {
  const { period, setPeriod, label, prev, next, startISO, endISO } = usePeriodRange('daily');
  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | undefined>();

  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const transactions =
    useLiveQuery(
      () => db.transactions.where('date').between(startISO, endISO, true, true).toArray(),
      [startISO, endISO],
    ) ?? [];

  const totalsByCategory = new Map<number, number>();
  let expenseTotal = 0;
  let incomeTotal = 0;
  for (const t of transactions) {
    totalsByCategory.set(t.categoryId, (totalsByCategory.get(t.categoryId) ?? 0) + t.amount);
    if (t.type === 'expense') expenseTotal += t.amount;
    else incomeTotal += t.amount;
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense' && !c.parentId);
  const incomeCategories = categories.filter((c) => c.type === 'income' && !c.parentId);

  return (
    <div className="flex flex-1 flex-col pb-24">
      <PeriodHeader period={period} setPeriod={setPeriod} label={label} onPrev={prev} onNext={next} />

      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-500">Expense</span>
          <span className="text-sm font-bold text-rose-500">{formatCurrency(expenseTotal)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {expenseCategories.map((c) => (
            <CategoryCard
              key={c.id}
              name={c.name}
              color={c.color}
              icon={c.icon}
              amount={totalsByCategory.get(c.id!) ?? 0}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 px-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-500">Income</span>
          <span className="text-sm font-bold text-emerald-500">{formatCurrency(incomeTotal)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {incomeCategories.map((c) => (
            <CategoryCard
              key={c.id}
              name={c.name}
              color={c.color}
              icon={c.icon}
              amount={totalsByCategory.get(c.id!) ?? 0}
            />
          ))}
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="mt-6 px-4">
          <span className="mb-2 block text-sm font-bold text-slate-500">Recent</span>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {transactions
              .slice()
              .sort((a, b) => (a.date < b.date ? 1 : -1))
              .slice(0, 8)
              .map((t) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                return (
                  <button
                    key={t.id}
                    onClick={() => setEditTx(t)}
                    className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0"
                  >
                    <div className="text-left">
                      <div className="text-sm font-semibold text-slate-700">{cat?.name ?? 'Uncategorized'}</div>
                      <div className="text-xs text-slate-400">{t.note || t.date}</div>
                    </div>
                    <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </span>
                  </button>
                );
              })}
          </div>
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
