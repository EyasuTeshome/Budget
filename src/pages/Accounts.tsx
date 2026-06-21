import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';
import { db } from '../db';
import Sheet from '../components/Sheet';
import AccountForm from '../components/AccountForm';
import { getColor } from '../lib/colors';
import { CategoryIcon } from '../components/CategoryIcon';
import { formatCurrency } from '../lib/format';
import type { Account } from '../types';

const TYPE_LABELS: Record<string, string> = {
  cash: 'Cash',
  debit: 'Debit',
  credit: 'Credit Card',
  mutual_fund: 'Mutual Fund',
  stock: 'Stock',
};

export default function Accounts() {
  const accounts = useLiveQuery(() => db.accounts.toArray(), []) ?? [];
  const transactions = useLiveQuery(() => db.transactions.toArray(), []) ?? [];
  const [addOpen, setAddOpen] = useState(false);
  const [editAcc, setEditAcc] = useState<Account | undefined>();

  function balanceFor(acc: Account) {
    let bal = acc.startingBalance;
    for (const t of transactions) {
      if (t.accountId !== acc.id) continue;
      bal += t.type === 'income' ? t.amount : -t.amount;
    }
    return bal;
  }

  const totalBalance = accounts.reduce((sum, a) => sum + balanceFor(a), 0);

  return (
    <div className="flex flex-1 flex-col pb-24">
      <div className="px-4 pt-6 text-center">
        <div className="text-xs font-semibold text-slate-400">Total Balance</div>
        <div className="text-3xl font-extrabold text-slate-800">{formatCurrency(totalBalance)}</div>
      </div>

      <div className="mt-6 flex flex-col gap-2.5 px-4">
        {accounts.map((a) => {
          const theme = getColor(a.color);
          const bal = balanceFor(a);
          return (
            <button
              key={a.id}
              onClick={() => setEditAcc(a)}
              className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${theme.iconBg} ${theme.iconText}`}>
                  <CategoryIcon name={a.icon} size={18} />
                </span>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-700">{a.name}</div>
                  <div className="text-xs text-slate-400">{TYPE_LABELS[a.type]}</div>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800">{formatCurrency(bal)}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setAddOpen(true)}
        className="mx-4 mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-bold text-slate-400"
      >
        <Plus size={16} /> Add Account
      </button>

      <Sheet open={addOpen} title="Add Account" onClose={() => setAddOpen(false)}>
        <AccountForm onDone={() => setAddOpen(false)} />
      </Sheet>
      <Sheet open={!!editAcc} title="Edit Account" onClose={() => setEditAcc(undefined)}>
        {editAcc && <AccountForm initial={editAcc} onDone={() => setEditAcc(undefined)} />}
      </Sheet>
    </div>
  );
}
