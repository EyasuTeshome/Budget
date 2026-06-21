import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { getColor } from '../lib/colors';
import { formatCurrency } from '../lib/format';

interface Slice {
  name: string;
  value: number;
  color: string;
}

export function CategoryDonut({ data }: { data: Slice[] }) {
  if (data.length === 0) {
    return <div className="flex h-48 items-center justify-center text-sm text-slate-400">No data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((d, i) => (
            <Cell key={i} fill={getColor(d.color).hex} stroke="none" />
          ))}
        </Pie>
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendLine({ data }: { data: { label: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Line type="monotone" dataKey="value" stroke="#f5b94d" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
