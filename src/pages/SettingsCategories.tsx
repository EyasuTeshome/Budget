import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';
import { db } from '../db';
import PageHeader from '../components/PageHeader';
import Sheet from '../components/Sheet';
import CategoryForm from '../components/CategoryForm';
import { Segmented } from '../components/FormControls';
import { getColor } from '../lib/colors';
import { CategoryIcon } from '../components/CategoryIcon';
import type { Category, TxType } from '../types';

export default function SettingsCategories() {
  const [type, setType] = useState<TxType>('expense');
  const [addOpen, setAddOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | undefined>();

  const categories = useLiveQuery(() => db.categories.where('type').equals(type).toArray(), [type]) ?? [];
  const topLevel = categories.filter((c) => !c.parentId);

  return (
    <div className="flex flex-1 flex-col pb-24">
      <PageHeader title="Categories" />
      <div className="px-4 pt-3">
        <Segmented value={type} onChange={setType} options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]} />
      </div>
      <div className="mt-4 flex flex-col gap-2.5 px-4">
        {topLevel.map((c) => {
          const theme = getColor(c.color);
          const subs = categories.filter((s) => s.parentId === c.id);
          return (
            <div key={c.id} className="rounded-2xl bg-white p-3.5 shadow-sm">
              <button onClick={() => setEditCat(c)} className="flex w-full items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.iconBg} ${theme.iconText}`}>
                  <CategoryIcon name={c.icon} size={16} />
                </span>
                <span className="text-sm font-bold text-slate-700">{c.name}</span>
              </button>
              {subs.length > 0 && (
                <div className="ml-6 mt-2 flex flex-col gap-1.5 border-l border-slate-100 pl-3">
                  {subs.map((s) => (
                    <button key={s.id} onClick={() => setEditCat(s)} className="text-left text-xs font-semibold text-slate-500">
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={() => setAddOpen(true)}
        className="mx-4 mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-bold text-slate-400"
      >
        <Plus size={16} /> Add Category
      </button>

      <Sheet open={addOpen} title="Add Category" onClose={() => setAddOpen(false)}>
        <CategoryForm onDone={() => setAddOpen(false)} />
      </Sheet>
      <Sheet open={!!editCat} title="Edit Category" onClose={() => setEditCat(undefined)}>
        {editCat && <CategoryForm initial={editCat} onDone={() => setEditCat(undefined)} />}
      </Sheet>
    </div>
  );
}
