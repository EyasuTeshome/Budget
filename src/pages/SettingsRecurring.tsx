import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';
import { db } from '../db';
import PageHeader from '../components/PageHeader';
import Sheet from '../components/Sheet';
import RecurringForm from '../components/RecurringForm';
import { getColor } from '../lib/colors';
import { CategoryIcon } from '../components/CategoryIcon';
import { formatCurrency } from '../lib/format';
import type { RecurringTransaction } from '../types';

export default function SettingsRecurring() {
  const recurring = useLiveQuery(() => db.recurring.toArray(), []) ?? [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<RecurringTransaction | undefined>();

  return (
    <div className="flex flex-1 flex-col pb-24">
      <PageHeader title="Recurring Transactions" />
      <div className="mt-4 flex flex-col gap-2.5 px-4">
        {recurring.map((r) => {
          const cat = categories.find((c) => c.id === r.categoryId);
          const theme = getColor(cat?.color ?? 'slate');
          return (
            <button
              key={r.id}
              onClick={() => setEditItem(r)}
              className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.iconBg} ${theme.iconText}`}>
                  <CategoryIcon name={cat?.icon ?? 'repeat'} size={16} />
                </span>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-700">{r.name}</div>
                  <div className="text-[11px] capitalize text-slate-400">
                    {r.frequency} · next {r.nextDate} {!r.active && '· paused'}
                  </div>
                </div>
              </div>
              <span className={`text-sm font-bold ${r.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {r.type === 'income' ? '+' : '-'}
                {formatCurrency(r.amount)}
              </span>
            </button>
          );
        })}
        {recurring.length === 0 && <div className="py-10 text-center text-sm text-slate-400">No recurring transactions</div>}
      </div>
      <button
        onClick={() => setAddOpen(true)}
        className="mx-4 mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-bold text-slate-400"
      >
        <Plus size={16} /> Add Recurring
      </button>

      <Sheet open={addOpen} title="Add Recurring Transaction" onClose={() => setAddOpen(false)}>
        <RecurringForm onDone={() => setAddOpen(false)} />
      </Sheet>
      <Sheet open={!!editItem} title="Edit Recurring Transaction" onClose={() => setEditItem(undefined)}>
        {editItem && <RecurringForm initial={editItem} onDone={() => setEditItem(undefined)} />}
      </Sheet>
    </div>
  );
}
