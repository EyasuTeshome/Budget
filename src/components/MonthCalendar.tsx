import clsx from 'clsx';
import { toISO } from '../lib/format';

interface DayTotal {
  income: number;
  expense: number;
}

interface Props {
  month: Date;
  totals: Map<string, DayTotal>;
  selected: string;
  onSelect: (iso: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthCalendar({ month, totals, selected, onSelect }: Props) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d));

  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = toISO(d);
          const t = totals.get(iso);
          const isSelected = iso === selected;
          const isToday = iso === toISO(new Date());
          return (
            <button
              key={iso}
              onClick={() => onSelect(iso)}
              className={clsx(
                'flex flex-col items-center gap-0.5 rounded-lg py-1',
                isSelected && 'bg-amber-100',
              )}
            >
              <span
                className={clsx(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold',
                  isToday ? 'bg-amber-400 text-white' : 'text-slate-600',
                )}
              >
                {d.getDate()}
              </span>
              <span className="flex h-6 flex-col text-[8px] font-bold leading-tight">
                {t?.income ? <span className="text-emerald-500">+{Math.round(t.income)}</span> : null}
                {t?.expense ? <span className="text-rose-400">-{Math.round(t.expense)}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
