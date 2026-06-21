import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Category, TxType } from '../types';
import { Field, inputClass, ColorPicker, IconPicker, Segmented } from './FormControls';

export default function CategoryForm({ initial, onDone }: { initial?: Category; onDone: () => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<TxType>(initial?.type ?? 'expense');
  const [color, setColor] = useState(initial?.color ?? 'amber');
  const [icon, setIcon] = useState(initial?.icon ?? 'tag');
  const [parentId, setParentId] = useState<number | undefined>(initial?.parentId ?? undefined);

  const parents = useLiveQuery(
    () => db.categories.filter((c) => c.type === type && !c.parentId).toArray(),
    [type],
  ) ?? [];

  async function handleSubmit() {
    if (!name.trim()) return;
    if (initial?.id) {
      await db.categories.update(initial.id, { name, type, color, icon, parentId: parentId ?? null });
    } else {
      await db.categories.add({ name, type, color, icon, parentId: parentId ?? null });
    }
    onDone();
  }

  async function handleDelete() {
    if (initial?.id) {
      await db.categories.delete(initial.id);
      onDone();
    }
  }

  return (
    <div>
      <Segmented value={type} onChange={setType} options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]} />
      <div className="mt-3" />
      <Field label="Name">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Groceries" />
      </Field>
      <Field label="Parent category (optional, for sub-category)">
        <select
          className={inputClass}
          value={parentId ?? ''}
          onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">None (top-level)</option>
          {parents
            .filter((p) => p.id !== initial?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
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
