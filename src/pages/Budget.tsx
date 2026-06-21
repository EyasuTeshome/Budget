import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';
import { db } from '../db';
import Sheet from '../components/Sheet';
import BudgetForm from '../components/BudgetForm';
import ProgressRing from '../components/ProgressRing';
import { Segmented } from '../components/FormControls';
import { CategoryDonut, TrendLine } from '../components/Charts';
import { getColor } from '../lib/colors';
import { CategoryIcon } from '../components/CategoryIcon';
import { formatCurrency, toISO } from '../lib/format';
import { currentBudgetRange } from '../lib/period';
import type { Budget, TxType } from '../types';

export default function BudgetPage() {
  const [tab, setTab] = useState<'plan' | 'stats'>('plan');
  const [statsType, setStatsType] = useState<TxType>('expense');
  const [addOpen, setAddOpen] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | undefined>();

  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const budgets = useLiveQuery(() => db.budgets.toArray(), []) ?? [];
  const transactions = useLiveQuery(() => db.transactions.toArray(), []) ?? [];

  const budgetRows = budgets.map((b) => {
    const cat = categories.find((c) => c.id === b.categoryId);
    const { startISO, endISO } = currentBudgetRange(b.period, b.startDate, b.endDate);
    const spent = transactions
      .filter((t) => t.categoryId === b.categoryId && t.type === 'expense' && t.date >= startISO && t.date <= endISO)
      .reduce((s, t) => s + t.amount, 0);
    return { budget: b, category: cat, spent };
  });

  const totalBudget = budgetRows.reduce((s, r) => s + r.budget.amount, 0);
  const totalSpent = budgetRows.reduce((s, r) => s + r.spent, 0);
  const remain = totalBudget - totalSpent;

  const now = new Date();
  const monthStart = toISO(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const monthTx = transactions.filter((t) => t.date >= monthStart && t.date <= monthEnd && t.type === statsType);

  const donutData = (() => {
    const byCat = new Map<number, number>();
    for (const t of monthTx) byCat.set(t.categoryId, (byCat.get(t.categoryId) ?? 0) + t.amount);
    return [...byCat.entries()]
      .map(([id, value]) => {
        const c = categories.find((c) => c.id === id);
        return { name: c?.name ?? 'Other', value, color: c?.color ?? 'slate' };
      })
      .sort((a, b) => b.value - a.value);
  })();

  const trendData = (() => {
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const byDay = new Array(days).fill(0);
    for (const t of monthTx) {
      const d = parseInt(t.date.slice(8, 10), 10);
      byDay[d - 1] += t.amount;
    }
    return byDay.map((value, i) => ({ label: String(i + 1), value }));
  })();

  return (
    <div className="flex flex-1 flex-col pb-24">
      <div className="px-4 pt-4">
        <Segmented value={tab} onChange={setTab} options={[{ value: 'plan', label: 'Plan' }, { value: 'stats', label: 'Stats' }]} />
      </div>

      {tab === 'plan' ? (
        <>
          <div className="mt-4 flex flex-col items-center">
            <ProgressRing progress={totalBudget ? totalSpent / totalBudget : 0} size={150} stroke={14} color="#34d399">
              <span className="text-xs text-slate-400">Remain</span>
              <span className="text-xl font-extrabold text-slate-800">{formatCurrency(remain)}</span>
              <span className="text-[11px] text-slate-400">of {formatCurrency(totalBudget)}</span>
            </ProgressRing>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 px-4">
            {budgetRows.map(({ budget, category, spent }) => {
              if (!category) return null;
              const theme = getColor(category.color);
              const pct = Math.min(1, spent / budget.amount);
              return (
                <button
                  key={budget.id}
                  onClick={() => setEditBudget(budget)}
                  className="rounded-2xl bg-white p-3.5 text-left shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${theme.iconBg} ${theme.iconText}`}>
                        <CategoryIcon name={category.icon} size={15} />
                      </span>
                      <div>
                        <div className="text-sm font-bold text-slate-700">{category.name}</div>
                        <div className="text-[11px] capitalize text-slate-400">{budget.period}</div>
                      </div>
                    </div>
                    <div className="text-right text-sm font-bold text-slate-700">
                      {formatCurrency(spent)} <span className="text-slate-400">/ {formatCurrency(budget.amount)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${pct >= 1 ? 'bg-rose-400' : theme.bar}`}
                      style={{ width: `${pct * 100}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setAddOpen(true)}
            className="mx-4 mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-bold text-slate-400"
          >
            <Plus size={16} /> Add Budget
          </button>
        </>
      ) : (
        <div className="px-4 pt-4">
          <Segmented
            value={statsType}
            onChange={setStatsType}
            options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]}
          />
          <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm">
            <div className="mb-1 text-sm font-bold text-slate-500">Trends</div>
            <TrendLine data={trendData} />
          </div>
          <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm">
            <div className="mb-1 text-sm font-bold text-slate-500">Categories</div>
            <CategoryDonut data={donutData} />
            <div className="mt-2 flex flex-col gap-1.5">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getColor(d.color).hex }} />
                    {d.name}
                  </span>
                  <span className="font-bold text-slate-700">{formatCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Sheet open={addOpen} title="Add Budget" onClose={() => setAddOpen(false)}>
        <BudgetForm onDone={() => setAddOpen(false)} />
      </Sheet>
      <Sheet open={!!editBudget} title="Edit Budget" onClose={() => setEditBudget(undefined)}>
        {editBudget && <BudgetForm initial={editBudget} onDone={() => setEditBudget(undefined)} />}
      </Sheet>
    </div>
  );
}
