import { getColor } from '../lib/colors';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../lib/format';

interface Props {
  name: string;
  color: string;
  icon: string;
  amount: number;
  budget?: number;
  onClick?: () => void;
}

export default function CategoryCard({ name, color, icon, amount, budget, onClick }: Props) {
  const theme = getColor(color);
  const pct = budget ? Math.min(1, amount / budget) : undefined;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-2 rounded-2xl ${theme.bg} p-3 text-left shadow-sm active:scale-[0.98] transition-transform`}
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${theme.iconBg} ${theme.iconText}`}>
          <CategoryIcon name={icon} size={16} strokeWidth={2.3} />
        </span>
      </div>
      <div className="text-xs font-semibold text-slate-500">{name}</div>
      <div className="text-sm font-bold text-slate-800">{formatCurrency(amount)}</div>
      {pct !== undefined && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/70">
          <div className={`h-full rounded-full ${theme.bar}`} style={{ width: `${pct * 100}%` }} />
        </div>
      )}
    </button>
  );
}
