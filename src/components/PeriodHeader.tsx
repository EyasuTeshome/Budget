import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ViewPeriod } from '../lib/period';

interface Props {
  period: ViewPeriod;
  setPeriod: (p: ViewPeriod) => void;
  label: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function PeriodHeader({ period, setPeriod, label, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center justify-between px-4 pt-2">
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value as ViewPeriod)}
        className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm outline-none"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <div className="flex items-center gap-1">
        <button onClick={onPrev} className="rounded-full p-1 text-slate-400 active:bg-slate-100">
          <ChevronLeft size={18} />
        </button>
        <span className="min-w-[110px] text-center text-sm font-bold text-slate-700">{label}</span>
        <button onClick={onNext} className="rounded-full p-1 text-slate-400 active:bg-slate-100">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
