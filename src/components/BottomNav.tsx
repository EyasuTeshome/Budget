import { NavLink } from 'react-router-dom';
import { Home, Landmark, ListChecks, PiggyBank, Settings } from 'lucide-react';
import clsx from 'clsx';

const TABS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/accounts', label: 'Account', icon: Landmark },
  { to: '/transactions', label: 'Transactions', icon: ListChecks },
  { to: '/budget', label: 'Budget', icon: PiggyBank },
  { to: '/settings', label: 'Setting', icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-black/5 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="flex items-stretch justify-between">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors',
                  isActive ? 'text-amber-500' : 'text-slate-400',
                )
              }
            >
              <Icon size={22} strokeWidth={2.2} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
