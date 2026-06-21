import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';
import { db } from '../db';
import PageHeader from '../components/PageHeader';
import Sheet from '../components/Sheet';
import SubscriptionForm from '../components/SubscriptionForm';
import { getColor } from '../lib/colors';
import { CategoryIcon } from '../components/CategoryIcon';
import { formatCurrency } from '../lib/format';
import type { Subscription } from '../types';

export default function SettingsSubscriptions() {
  const subs = useLiveQuery(() => db.subscriptions.toArray(), []) ?? [];
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Subscription | undefined>();

  const activeTotal = subs.filter((s) => s.active).reduce((sum, s) => {
    const monthly = s.frequency === 'weekly' ? s.amount * 4.33 : s.frequency === 'daily' ? s.amount * 30 : s.amount;
    return sum + monthly;
  }, 0);

  return (
    <div className="flex flex-1 flex-col pb-24">
      <PageHeader title="Subscription Manager" />
      <div className="px-4 pt-2 text-center">
        <div className="text-xs font-semibold text-slate-400">Est. monthly cost</div>
        <div className="text-2xl font-extrabold text-slate-800">{formatCurrency(activeTotal)}</div>
      </div>
      <div className="mt-4 flex flex-col gap-2.5 px-4">
        {subs.map((s) => {
          const theme = getColor(s.color);
          return (
            <button
              key={s.id}
              onClick={() => setEditItem(s)}
              className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.iconBg} ${theme.iconText}`}>
                  <CategoryIcon name={s.icon} size={16} />
                </span>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-700">{s.name}</div>
                  <div className="text-[11px] capitalize text-slate-400">
                    {s.frequency} · next {s.nextBillingDate} {!s.active && '· paused'}
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold text-rose-500">-{formatCurrency(s.amount)}</span>
            </button>
          );
        })}
        {subs.length === 0 && <div className="py-10 text-center text-sm text-slate-400">No subscriptions tracked</div>}
      </div>
      <button
        onClick={() => setAddOpen(true)}
        className="mx-4 mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-bold text-slate-400"
      >
        <Plus size={16} /> Add Subscription
      </button>

      <Sheet open={addOpen} title="Add Subscription" onClose={() => setAddOpen(false)}>
        <SubscriptionForm onDone={() => setAddOpen(false)} />
      </Sheet>
      <Sheet open={!!editItem} title="Edit Subscription" onClose={() => setEditItem(undefined)}>
        {editItem && <SubscriptionForm initial={editItem} onDone={() => setEditItem(undefined)} />}
      </Sheet>
    </div>
  );
}
