import { type ReactNode } from 'react';
import clsx from 'clsx';
import { COLOR_KEYS, getColor } from '../lib/colors';
import { ICON_KEYS } from '../lib/icons';
import { CategoryIcon } from './CategoryIcon';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-amber-400 focus:bg-white';

export function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_KEYS.map((key) => {
        const theme = getColor(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={clsx(
              'h-8 w-8 rounded-full border-2',
              value === key ? 'border-slate-700' : 'border-transparent',
            )}
            style={{ backgroundColor: theme.hex }}
          />
        );
      })}
    </div>
  );
}

export function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ICON_KEYS.map((key) => {
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={clsx(
              'flex h-9 w-9 items-center justify-center rounded-full border-2',
              value === key ? 'border-amber-400 bg-amber-50 text-amber-600' : 'border-slate-200 text-slate-500',
            )}
          >
            <CategoryIcon name={key} size={16} />
          </button>
        );
      })}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-full bg-slate-100 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            'flex-1 rounded-full py-1.5 text-xs font-bold transition-colors',
            value === opt.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
