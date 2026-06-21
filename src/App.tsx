import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import BudgetPage from './pages/Budget';
import Settings from './pages/Settings';
import SettingsCategories from './pages/SettingsCategories';
import SettingsRecurring from './pages/SettingsRecurring';
import SettingsSubscriptions from './pages/SettingsSubscriptions';
import SettingsData from './pages/SettingsData';
import SettingsAbout from './pages/SettingsAbout';
import { seedIfEmpty } from './db';
import { processDueRecurring } from './lib/recurring';

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await seedIfEmpty();
      await processDueRecurring();
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Loading…</div>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/categories" element={<SettingsCategories />} />
        <Route path="/settings/recurring" element={<SettingsRecurring />} />
        <Route path="/settings/subscriptions" element={<SettingsSubscriptions />} />
        <Route path="/settings/data" element={<SettingsData />} />
        <Route path="/settings/about" element={<SettingsAbout />} />
      </Routes>
      <BottomNav />
    </HashRouter>
  );
}

export default App;
