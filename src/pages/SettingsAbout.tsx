import PageHeader from '../components/PageHeader';

export default function SettingsAbout() {
  return (
    <div className="flex flex-1 flex-col pb-24">
      <PageHeader title="About" />
      <div className="mt-4 px-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm font-bold text-slate-700">Budget Planner</div>
          <div className="mt-1 text-xs text-slate-400">
            A personal finance app for budget planning, spending tracking and money management.
            All data is stored locally on this device.
          </div>
        </div>
      </div>
    </div>
  );
}
