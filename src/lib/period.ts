import { useMemo, useState } from 'react';
import { toISO } from './format';

export type ViewPeriod = 'daily' | 'weekly' | 'monthly';

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  const day = out.getDay();
  out.setDate(out.getDate() - day);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function currentBudgetRange(period: 'weekly' | 'monthly' | 'custom', startDate: string, endDate?: string) {
  const today = new Date();
  if (period === 'weekly') {
    const start = startOfWeek(today);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { startISO: toISO(start), endISO: toISO(end) };
  }
  if (period === 'monthly') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { startISO: toISO(start), endISO: toISO(end) };
  }
  return { startISO: startDate, endISO: endDate ?? toISO(today) };
}

export function usePeriodRange(initial: ViewPeriod = 'monthly') {
  const [period, setPeriod] = useState<ViewPeriod>(initial);
  const [anchor, setAnchor] = useState(new Date());

  const { start, end, label } = useMemo(() => {
    if (period === 'daily') {
      const start = new Date(anchor);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      const isToday = toISO(start) === toISO(new Date());
      return {
        start,
        end,
        label: isToday ? 'Today' : start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      };
    }
    if (period === 'weekly') {
      const start = startOfWeek(anchor);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
      };
    }
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999);
    const isThisMonth =
      anchor.getFullYear() === new Date().getFullYear() && anchor.getMonth() === new Date().getMonth();
    return {
      start,
      end,
      label: isThisMonth ? 'This Month' : start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    };
  }, [period, anchor]);

  function shift(dir: 1 | -1) {
    const next = new Date(anchor);
    if (period === 'daily') next.setDate(next.getDate() + dir);
    else if (period === 'weekly') next.setDate(next.getDate() + dir * 7);
    else next.setMonth(next.getMonth() + dir);
    setAnchor(next);
  }

  return {
    period,
    setPeriod,
    start,
    end,
    label,
    anchor,
    setAnchor,
    next: () => shift(1),
    prev: () => shift(-1),
    startISO: toISO(start),
    endISO: toISO(end),
  };
}
