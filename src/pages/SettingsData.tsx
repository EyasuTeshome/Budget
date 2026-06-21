import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import PageHeader from '../components/PageHeader';
import { exportTransactionsCsv, downloadCsv, importTransactionsCsv } from '../lib/csv';

export default function SettingsData() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');
  const accounts = useLiveQuery(() => db.accounts.toArray(), []) ?? [];

  async function handleExport() {
    const csv = await exportTransactionsCsv();
    downloadCsv(csv, `transactions-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !accounts[0]?.id) return;
    const text = await file.text();
    const result = await importTransactionsCsv(text, accounts[0].id);
    setStatus(`Imported ${result.imported} transaction(s), skipped ${result.skipped}.`);
    e.target.value = '';
  }

  return (
    <div className="flex flex-1 flex-col pb-24">
      <PageHeader title="Export & Import" />
      <div className="mt-4 flex flex-col gap-3 px-4">
        <button onClick={handleExport} className="rounded-2xl bg-white p-4 text-left shadow-sm">
          <div className="text-sm font-bold text-slate-700">Export transactions as CSV</div>
          <div className="text-xs text-slate-400">Downloads all transactions to a .csv file</div>
        </button>
        <button onClick={() => fileRef.current?.click()} className="rounded-2xl bg-white p-4 text-left shadow-sm">
          <div className="text-sm font-bold text-slate-700">Import transactions from CSV</div>
          <div className="text-xs text-slate-400">Columns: date, type, amount, category, account, note</div>
        </button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
        {status && <div className="px-1 text-xs font-semibold text-emerald-600">{status}</div>}
      </div>
    </div>
  );
}
