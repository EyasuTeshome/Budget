import { Link } from 'react-router-dom';
import { Tag, Repeat, CreditCard, FileDown, Info, ChevronRight } from 'lucide-react';

const ITEMS = [
  { to: '/settings/categories', label: 'Categories', icon: Tag },
  { to: '/settings/recurring', label: 'Recurring Transactions', icon: Repeat },
  { to: '/settings/subscriptions', label: 'Subscription Manager', icon: CreditCard },
  { to: '/settings/data', label: 'Export & Import', icon: FileDown },
  { to: '/settings/about', label: 'About', icon: Info },
];

export default function Settings() {
  return (
    <div className="flex flex-1 flex-col pb-24">
      <div className="px-4 pt-6">
        <h1 className="text-xl font-extrabold text-slate-800">Settings</h1>
      </div>
      <div className="mt-4 flex flex-col gap-2 px-4">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
          >
            <span className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <Icon size={18} className="text-slate-400" />
              {label}
            </span>
            <ChevronRight size={16} className="text-slate-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
