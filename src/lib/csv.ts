import { db } from '../db';
import type { Transaction } from '../types';

function escapeCsv(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function exportTransactionsCsv(): Promise<string> {
  const [transactions, categories, accounts] = await Promise.all([
    db.transactions.orderBy('date').toArray(),
    db.categories.toArray(),
    db.accounts.toArray(),
  ]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const accName = new Map(accounts.map((a) => [a.id, a.name]));

  const header = ['date', 'type', 'amount', 'category', 'account', 'note'];
  const rows = transactions.map((t) =>
    [
      t.date,
      t.type,
      t.amount,
      catName.get(t.categoryId) ?? '',
      accName.get(t.accountId) ?? '',
      t.note ?? '',
    ]
      .map(escapeCsv)
      .join(','),
  );
  return [header.join(','), ...rows].join('\n');
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export interface ImportResult {
  imported: number;
  skipped: number;
}

export async function importTransactionsCsv(
  text: string,
  defaultAccountId: number,
): Promise<ImportResult> {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { imported: 0, skipped: 0 };
  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const categories = await db.categories.toArray();
  const accounts = await db.accounts.toArray();
  const catByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));
  const accByName = new Map(accounts.map((a) => [a.name.toLowerCase(), a]));

  let imported = 0;
  let skipped = 0;
  const toAdd: Transaction[] = [];

  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    const date = cols[idx('date')]?.trim();
    const type = cols[idx('type')]?.trim().toLowerCase() === 'income' ? 'income' : 'expense';
    const amount = parseFloat(cols[idx('amount')] ?? '');
    const categoryName = cols[idx('category')]?.trim() ?? '';
    const accountName = cols[idx('account')]?.trim() ?? '';
    const note = idx('note') >= 0 ? cols[idx('note')] : '';

    if (!date || Number.isNaN(amount)) {
      skipped++;
      continue;
    }
    let category = catByName.get(categoryName.toLowerCase());
    if (!category) {
      const id = await db.categories.add({
        name: categoryName || 'Imported',
        type,
        color: 'slate',
        icon: 'tag',
      });
      category = { id, name: categoryName || 'Imported', type, color: 'slate', icon: 'tag' };
      catByName.set(category.name.toLowerCase(), category);
    }
    const account = accByName.get(accountName.toLowerCase());
    const accountId = account?.id ?? defaultAccountId;

    toAdd.push({
      date,
      amount: Math.abs(amount),
      type,
      categoryId: category.id!,
      accountId,
      note,
    });
    imported++;
  }

  if (toAdd.length) await db.transactions.bulkAdd(toAdd);
  return { imported, skipped };
}
